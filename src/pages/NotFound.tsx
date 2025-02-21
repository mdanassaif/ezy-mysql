import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
 const location = useLocation();

 useEffect(() => {
   console.error(
     "404 Error: Page not found at:",
     location.pathname
   );
 }, [location.pathname]);

 return (
   <div className="min-h-screen flex items-center justify-center bg-gray-100">
     <div className="text-center">
       <h1 className="text-4xl font-bold mb-4">404</h1>
       <p className="text-xl mb-4">Our database dropped like my grandma's WiFi connection</p>
       <p className="text-md mb-6">Try again when we've picked up the pieces</p>
       <a href="/" className="text-teal-500 hover:text-teal-700 underline">
         Go Home
       </a>
     </div>
   </div>
 );
};

export default NotFound;