import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (username === "admin" && password === "admin") {
    toast.success("Login success!");
    setTimeout(() => {
      navigate("/capsul");
    }, 1000);
  } else {
    toast.error("Invalid credentials");
  }
  setLoading(false);
};

  return (
    <div className="flex w-full h-screen items-center justify-center bg-gradient-to-br from-[#00ABE4] via-[#3EC6E0] to-[#005F99]">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-2xl flex flex-col">
        <ToastContainer position="top-center" />
        <div className="my-auto">
          <h1 className="mb-6 text-center text-3xl font-extrabold text-[#005F99] drop-shadow-lg">Login</h1>
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-6">
              <label className="font-semibold block mb-2 text-[#005F99]" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-3 border border-[#00ABE4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ABE4] transition"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="font-semibold block mb-2 text-[#005F99]" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-[#00ABE4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ABE4] transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00ABE4] to-[#005F99] text-white font-bold py-3 rounded-lg shadow-md hover:from-[#005F99] hover:to-[#00ABE4] transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;