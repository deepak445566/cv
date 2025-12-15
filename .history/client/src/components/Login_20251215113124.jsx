import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

function Login() {
  const { setShowLogin, login, register, navigate } = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmitHandle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (state === "register") {
        result = await register({ name, email, password });
      } else {
        result = await login({ email, password });
      }

      if (result.success) {
        navigate('/');
        setShowLogin(false);
        toast.success(state === "register" ? "Registration successful!" : "Login successful!");
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setShowLogin(false)} 
        className='fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50'
      >
        <form 
          onSubmit={onSubmitHandle} 
          onClick={(e) => e.stopPropagation()} 
          className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
        >
          <p className="text-2xl font-medium m-auto">
            <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
          </p>
          
          {state === "register" && (
            <div className="w-full">
              <p>Name</p>
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                placeholder="Enter your name" 
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary-dull" 
                type="text" 
                required 
                disabled={loading}
              />
            </div>
          )}
          
          <div className="w-full">
            <p>Email</p>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              placeholder="Enter your email" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary-dull" 
              type="email" 
              required 
              disabled={loading}
            />
          </div>
          
          <div className="w-full">
            <p>Password</p>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              placeholder="Enter your password" 
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary-dull" 
              type="password" 
              required 
              disabled={loading}
            />
          </div>
          
          {state === "register" ? (
            <p>
              Already have an account?{' '}
              <span 
                onClick={() => setState("login")} 
                className="text-primary cursor-pointer hover:underline"
              >
                Click here
              </span>
            </p>
          ) : (
            <p>
              Create an account?{' '}
              <span 
                onClick={() => setState("register")} 
                className="text-primary cursor-pointer hover:underline"
              >
                Click here
              </span>
            </p>
          )}
          
          <button 
            type="submit"
            className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span>Processing...</span>
            ) : state === "register" ? (
              "Create Account"
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </>
  )
}

export default Login;