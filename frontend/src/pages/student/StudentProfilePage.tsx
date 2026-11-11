import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Phone, Mail, MapPin, Award, Calendar, Heart, Shield, BookOpen } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={profile.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.rollNumber}`}
          alt={profile.user.name}
          className="w-24 h-24 rounded-2xl border-4 border-slate-100 shadow-md bg-slate-50 object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{profile.user.name}</h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                USN: <span className="font-mono text-slate-900 font-bold tracking-wide">{profile.rollNumber}</span>
              </p>
            </div>
            <span className="self-center sm:self-start bg-sky-100 text-sky-800 text-xs px-3 py-1 rounded-full font-bold">
              Active Enrolled Student
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Department</p>
              <p className="text-sm font-semibold text-slate-800">{profile.department.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Current Semester</p>
              <p className="text-sm font-semibold text-slate-800">Semester {profile.currentSemester}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Current CGPA</p>
              <p className="text-sm font-bold text-emerald-600">{profile.cgpa.toFixed(2)} / 10.0</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Credits Earned</p>
              <p className="text-sm font-bold text-sky-600">{profile.earnedCredits} Credits</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Grid Sections: Personal & Academic History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" /> Personal & Contact Details
          </h2>
          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Email Address</span>
              <span className="font-medium text-slate-800">{profile.user.email}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Mobile Phone</span>
              <span className="font-medium text-slate-800">{profile.user.phone || '+91 98765 00000'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Gender / Blood Group</span>
              <span className="font-medium text-slate-800">{profile.gender || 'Not specified'} • {profile.bloodGroup || 'O+'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Admission Year</span>
              <span className="font-medium text-slate-800">{profile.admissionYear}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Permanent Address</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{profile.address || 'University Campus, Guntur'}</span>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Parent / Guardian Information
          </h2>
          {profile.parentLinks && profile.parentLinks.length > 0 ? (
            profile.parentLinks.map((link: any) => (
              <div key={link.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 text-sm">{link.parent.user.name}</p>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {link.relationship || 'Guardian'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Email: {link.parent.user.email}</p>
                <p className="text-xs text-slate-500">Phone: {link.parent.user.phone || 'Available on record'}</p>
                <p className="text-xs text-slate-500">Occupation: {link.parent.occupation || 'N/A'}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No linked parent account registered yet.</p>
          )}

          {/* Academic History */}
          <h3 className="text-sm font-bold text-slate-900 pt-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" /> Semester Grade History
          </h3>
          <div className="space-y-2">
            {profile.semesterResults?.map((res: any) => (
              <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{res.semester.name}</p>
                  <p className="text-slate-500">Credits Completed: {res.earnedCredits}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 text-sm">SGPA: {res.sgpa.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-400">Published</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

