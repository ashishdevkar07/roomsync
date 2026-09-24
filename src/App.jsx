import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import ProfileDetail from "./pages/ProfileDetail";
import ProtectedRoute from "./components/ProtectedRoutes";
import MyProfile from "./pages/MyProfile";
import Saved from "./pages/Saved";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute> <Dashboard /></ProtectedRoute>
                } />

                <Route path="/complete-profile" element={
                    <ProtectedRoute> <CompleteProfile /></ProtectedRoute>
                } />

                <Route path="/browse" element={
                    <ProtectedRoute> <Browse /></ProtectedRoute>
                } />

                <Route path="/profile/:id" element={
                    <ProtectedRoute> <ProfileDetail /></ProtectedRoute>
                } />

                <Route path="/my-profile" element={
                    <ProtectedRoute><MyProfile /></ProtectedRoute>
                } />

                <Route path="/saved" element={
                    <ProtectedRoute><Saved /></ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App