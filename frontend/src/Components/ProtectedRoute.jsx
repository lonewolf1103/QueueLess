import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';

const ProtectedRoute = ({children,role}) => {

    const {user,loading} = useContext(AuthContext);
    

    if(loading){
        return(
            <div>
                loading...
            </div>
        )
    }

    if(!user){
        return <Navigate to='/login' replace/>
    }


    if(user.role !== role){
        return user.role === 'admin'
        ?<Navigate to='/admin' replace/>
        :<Navigate to='/user' replace/>
    }

  return children
}

export default ProtectedRoute
