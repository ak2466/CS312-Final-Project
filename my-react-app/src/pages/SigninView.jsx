import { useState } from 'react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const SigninView = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const navigate = useNavigate();

  const onLogin = (e) => {
    console.log("Signed in: ", email, password);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to Submit Recipes</p>
        </div>
        
        <div className="shadow-xl border-0 bg-white rounded-xl shadow-sm">
          <form className="space-y-6 p-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <input 
              label="Email Address"
              type="email"
              placeholder="Email"
              className='border border-gray-300 w-full px-4 py-2.5 rounded-md'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              label="Password"
              type="password"
              placeholder='Password'
              className='border border-gray-300 w-full px-4 py-2.5 rounded-md'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full py-1" variant="primary" type='submit'>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SigninView;