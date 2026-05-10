import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface childProps {
    children : ReactNode
}

const ProtectedRoute = ({children}: childProps) => {
    const token = localStorage.getItem('token');

    if(!token){
        return <Navigate to="/login" replace />
    }

  return (
    <>
      {children}
    </>
  )
}

export default ProtectedRoute