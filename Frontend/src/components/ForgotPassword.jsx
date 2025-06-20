import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; 

export default function ForgotPassword() {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const res = await axios.post('https://circleup-3wqg.onrender.com/user/resetpassword', {
                username,
                newPassword,
                confirmPassword
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
            <form onSubmit={handleSubmit} className="p-8 rounded-xl w-full max-w-sm space-y-4 shadow-lg border" style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}>
                <h2 className="text-2xl font-bold mb-4 text-center text-white">Reset Password</h2>

                <label className="block text-sm font-medium text-white">Username</label>
                <input
                    type="text"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border bg-neutral-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 border-neutral-700"
                />

                <label className="block text-sm font-medium text-white">New Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border bg-neutral-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 border-neutral-700 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-3 text-white"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <label className="block text-sm font-medium text-white">Confirm Password</label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border bg-neutral-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 border-neutral-700 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute right-3 top-3 text-white"
                    >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                    Reset Password
                </button>
            </form>
        </div>
    );
}
