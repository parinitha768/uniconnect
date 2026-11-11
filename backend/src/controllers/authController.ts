import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email / USN and password are required.' });
      return;
    }

    const identifier = (email || '').trim();

    // 1. Try finding user directly by email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { email: `${identifier.toLowerCase()}@uniconnect.edu` },
        ],
      },
      include: {
        student: {
          include: { department: true },
        },
        faculty: {
          include: { department: true },
        },
        parent: {
          include: {
            studentLinks: {
              include: {
                student: {
                  include: { user: true, department: true },
                },
              },
            },
          },
        },
      },
    });

    // 2. If not found by email, try finding student by USN / rollNumber (e.g. 1NC24IS001)
    if (!user) {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { rollNumber: identifier },
            { rollNumber: identifier.toUpperCase() },
            { rollNumber: identifier.toLowerCase() },
          ],
        },
        include: {
          user: {
            include: {
              student: { include: { department: true } },
              faculty: { include: { department: true } },
              parent: {
                include: {
                  studentLinks: {
                    include: {
                      student: { include: { user: true, department: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (student && student.user) {
        user = student.user as any;
      }
    }

    // 3. If not found, try finding faculty by employeeId (e.g. NUFAC-001)
    if (!user) {
      const faculty = await prisma.faculty.findFirst({
        where: {
          OR: [
            { employeeId: identifier },
            { employeeId: identifier.toUpperCase() },
          ],
        },
        include: {
          user: {
            include: {
              student: { include: { department: true } },
              faculty: { include: { department: true } },
              parent: {
                include: {
                  studentLinks: {
                    include: {
                      student: { include: { user: true, department: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (faculty && faculty.user) {
        user = faculty.user as any;
      }
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid Email / USN or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid Email / USN or password.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'uniconnect-secret-key-2026';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        student: user.student,
        faculty: user.faculty,
        parent: user.parent,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        student: {
          include: {
            department: true,
            parentLinks: {
              include: {
                parent: { include: { user: true } },
              },
            },
          },
        },
        faculty: {
          include: { department: true },
        },
        parent: {
          include: {
            studentLinks: {
              include: {
                student: {
                  include: { user: true, department: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Omit password
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const { phone, avatar, password } = req.body;
    const updateData: any = {};

    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating profile.' });
  }
};

