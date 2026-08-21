// This checks if user is logged in before showing any page
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }){
    // check if the user is logged in or not 
    const userId = localStorage.getItem("userId")

    if(!userId){
        return <Navigate to= "/login" replace />
    }

    return children
}

export default ProtectedRoute