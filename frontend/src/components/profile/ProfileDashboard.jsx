import React, { useEffect } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export function ProfileDashboard() {
  const { user } = useAuthStore();
  const { profile, fetchProfile, isLoading } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading || !profile) {
    return <div className="p-8 text-center text-gray-500">Loading profile data...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto mt-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Investor Profile</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          {profile.primary_segment ? profile.primary_segment.replace(/_/g, ' ') : 'Unsegmented'}
        </span>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
          <span className="text-sm font-bold text-blue-600">{profile.profile_completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${profile.profile_completeness}%` }}></div>
        </div>
        {profile.profile_completeness < 100 && (
          <p className="text-sm text-gray-500 mt-3 pt-2 border-t border-gray-200">
            Complete your profile to get better recommendations. <Link to="/onboarding" className="text-blue-600 font-medium hover:underline ml-1">Complete now &rarr;</Link>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Personal Details</h3>
          <div className="space-y-2">
            <p className="text-gray-800 flex justify-between border-b pb-1"><span className="text-gray-500">Name:</span> <span className="font-medium text-right">{user?.name}</span></p>
            <p className="text-gray-800 flex justify-between border-b pb-1"><span className="text-gray-500">Email:</span> <span className="font-medium text-right">{user?.email}</span></p>
            <p className="text-gray-800 flex justify-between border-b pb-1"><span className="text-gray-500">Age Group:</span> <span className="font-medium text-right">{profile.age_group || 'Not set'}</span></p>
            <p className="text-gray-800 flex justify-between pb-1"><span className="text-gray-500">Occupation:</span> <span className="font-medium text-right">{profile.occupation || 'Not set'}</span></p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Investment Profile</h3>
          <div className="space-y-2">
            <p className="text-gray-800 flex justify-between border-b pb-1"><span className="text-gray-500">Experience:</span> <span className="font-medium text-right capitalize">{profile.investment_experience || 'Not set'}</span></p>
            <p className="text-gray-800 flex justify-between pb-1"><span className="text-gray-500">Risk Tolerance:</span> <span className="font-medium text-right capitalize">{profile.risk_tolerance || 'Not set'}</span></p>
          </div>
        </div>
      </div>
      
      {profile.interests && profile.interests.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(interest => (
              <span key={interest} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
