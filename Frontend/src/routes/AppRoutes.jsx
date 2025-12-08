import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Project from "../screens/Project";
import Settings from "../screens/Settings";
import OAuthCallback from "../components/OAuthCallback";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/project" element={<Project/>} />
        <Route path="/project/:projectId" element={<Project/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/auth/google/callback" element={<OAuthCallback/>} />
        <Route path="/auth/github/callback" element={<OAuthCallback/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
