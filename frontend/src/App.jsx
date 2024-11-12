import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {

  const { data:authUser, isLoading, error, isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () =>{
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(data.error) return null;
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        console.log("authentic user is here",data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry:false,
  });

  if(isLoading){
    return(
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg"/>
      </div>
    )
  }
console.log(authUser);
  return (
    <div className='flex max-w-6xl mx-auto'>
      <Sidebar/>
      
      <Routes>
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login"></Navigate>}></Route>
        <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to="/"></Navigate>}></Route>
        <Route path="/signup" element={!authUser ? <SignUpPage/>: <Navigate to="/"></Navigate>}></Route>
        <Route path="/notifications" element={authUser ? <NotificationPage/> : <Navigate to="/login"></Navigate>}></Route>
        <Route path="/profile/:username" element={authUser ? <ProfilePage/> : <Navigate to="/login"></Navigate>}></Route>
      </Routes>
      <RightPanel/>
      <Toaster/>
    </div>
  );
}

export default App;
