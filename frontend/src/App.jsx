import React from "react";
import ProtectedRoute from "./Components/ProtectedRoute";
import  { Toaster } from "react-hot-toast";
import Register from "./Pages/Register";
import Loginpage from "./Pages/Loginpage";
import { Route, Routes, Navigate } from "react-router-dom";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";

const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
