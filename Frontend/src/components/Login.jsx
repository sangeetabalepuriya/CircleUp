import React, { useEffect, useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

export default function Login() {
    const [input, setInput] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    function changeEventHandler(e) {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    async function signUpHandler(e) {
        e.preventDefault();
        console.log(input);
        try {
            setLoading(true);
            const res = await axios.post("https://circleup-mqwe.onrender.com/user/login", input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            // toast.success("Registration successful");
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    password: ""
                })
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
            <div className="w-full max-w-md px-6">
                <form onSubmit={signUpHandler} className="p-8 rounded-2xl shadow-2xl w-full space-y-6 border" style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>CircleUp</h1>
                        <p className="text-sm" style={{ color: '#a3a3a3' }}>Welcome back! Please login to your account</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: '#ffffff' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={input.username}
                            onChange={changeEventHandler}
                            placeholder="Enter your username"
                            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 placeholder-gray-500"
                            style={{
                                backgroundColor: '#0f0f0f',
                                borderColor: '#333333',
                                color: '#ffffff',
                                focusRingColor: '#3b82f6'
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: '#ffffff' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={input.password}
                            onChange={changeEventHandler}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 placeholder-gray-500"
                            style={{
                                backgroundColor: '#0f0f0f',
                                borderColor: '#333333',
                                color: '#ffffff',
                                focusRingColor: '#3b82f6'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: '#3b82f6',
                            color: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Logging in...</span>
                            </div>
                        ) : (
                            "Login"
                        )}
                    </button>
                    <Link to="/forgotpassword" className="text-blue-500 text-sm hover:underline  ml-55">
                        Forgot password?
                    </Link>


                    <div className="text-center pt-4 border-t" style={{ borderColor: '#333333' }}>
                        <span className="text-sm" style={{ color: '#a3a3a3' }}>
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-semibold hover:underline transition-colors duration-200"
                                style={{ color: '#3b82f6' }}
                                onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                                onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                            >
                                Sign up
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}



