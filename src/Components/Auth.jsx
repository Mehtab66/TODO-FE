import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../../Api.config";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();
  const checkUserInDB = async () => {
    if (isAuthenticated && user) {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${BASE_API_URL}/todo/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            auth0Id: user.sub,
            name: user.name,
            email: user.email,
          }),
        });

        const data = await response.json();

        if (data.newUser) {
          console.log("New user created:", data.user);
        } else {
          console.log("User already exists:", data.user);
        }

        navigate("/dashboard"); // Redirect after login
        isSignUp(false);
      } catch (error) {
        console.error("Error checking user in DB:", error);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      // Handle sign-up logic here
      try {
        const response = await fetch(`${BASE_API_URL}/todo/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            name: userData.name,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to sign up");
        }

        const data = await response.json();
        console.log("User signed up:", data);

        // Redirect after successful sign-up
        navigate("/dashboard");
      } catch (error) {
        console.error("Error during sign-up:", error);
      }
    } else {
      // Handle login logic here
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${BASE_API_URL}/todo/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            auth0Id: user.sub,
          }),
        });

        if (response.ok) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking user in DB:", error);
      }
    }
  };

  useEffect(() => {
    checkUserInDB();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Handle Manual Signup/Login
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? "register" : "login";
    const requestBody = isSignUp
      ? {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }
      : { email: userData.email, password: userData.password };
    try {
      const response = await fetch(`${BASE_API_URL}/todo/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Response Ok");
        if (isSignUp) {
          alert("Please Login with Credential Now to access Dashboard");
          setUserData({ name: "", email: "", password: "" });
          setIsSignUp(false); // Switch to login form
        } else {
          localStorage.setItem("token", result.token);
          localStorage.setItem("email", result.user.email);
          localStorage.setItem("name", result.user.name);
          navigate("/dashboard");
        }
        // navigate("/");
      } else if (response.status === 400) {
        alert(result.message);
      } else if (response.status === 402) {
        alert(result.message);
      } else if (response.status === 404) {
        alert(result.message);
      } else if (response.status === 500) {
        console.log(result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-indigo-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl  font-bold text-center text-gray-800 mb-6">
          {isSignUp ? "Sign Up" : "Log In"}
        </h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              className="p-3 border rounded-md"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded-md"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border rounded-md"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="text-center my-4 text-gray-600">or</div>

        <button
          onClick={() => loginWithRedirect()}
          className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 py-2 rounded-md transition duration-200 ease-in-out transform hover:scale-105"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
            alt="Google Logo"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        <p className="text-center text-gray-600 mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isSignUp ? "Login" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
