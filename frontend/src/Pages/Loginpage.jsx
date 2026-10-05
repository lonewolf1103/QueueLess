import React, { useContext, useState } from "react";
import api from "../Services/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const Loginpage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {login} = useContext(AuthContext);

  const navigate = useNavigate() ;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });
      toast.success(response.data.message);
      login(response.data.user)

      if(response.data.user.role === 'admin'){
        navigate('/admin')
      }
      else{
        navigate('/user')
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">QueueLess</h1>
        </div>

        <p className="mt-2 text-sm text-slate-500">Smart queue management</p>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to continue your queue
            </p>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-shadow-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-shadow-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-shadow-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-shadow-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white transition hover:bg-slate-800 cursor-pointer"
          >
            Login
          </button>
          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-shadow-slate-900 hover:underline"
            >
              {" "}
              <span>Register</span>{" "}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Loginpage;
