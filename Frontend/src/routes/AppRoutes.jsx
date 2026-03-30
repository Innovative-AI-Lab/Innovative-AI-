import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Project from "../screens/Project";
import NoSidebarLayout from "../components/NoSidebarLayout";
import Settings from "../screens/Settings";
import Help from "../screens/Help";
import OAuthCallback from "../components/OAuthCallback";
import AIResponsePage from "../screens/AIResponsePage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/projects" element={<Home/>} />
        <Route path="/ai-studio" element={<Home/>} />
        <Route path="/activity" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/project" element={<Project/>} />
        <Route path="/project/:projectId" element={<Project/>} />
        <Route path="/settings" element={
          <NoSidebarLayout>
            <Settings/>
          </NoSidebarLayout>
        } />
        <Route path="/help" element={
          <NoSidebarLayout>
            <Help/>
          </NoSidebarLayout>
        } />
        <Route path="/ai-response/:id" element={<AIResponsePage/>} />
        <Route path="/auth/google/callback" element={<OAuthCallback/>} />
        <Route path="/auth/github/callback" element={<OAuthCallback/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
