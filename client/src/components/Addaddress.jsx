import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input 
    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition' 
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name] || ''}
    required
  />
)

function Addaddress() {
  const { axios, user, navigate, fetchUser } = useAppContext();
  
  const [address, setAddress] = useState({
    firstname: "",
    lastname: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = ['firstname', 'lastname', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    
    for (let field of requiredFields) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(address.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (address.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add address');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Making API call to /api/address/add');
      console.log('Current user:', user);
      
    
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const requestData = {
        address: address
      };
      
      console.log('Request Data:', requestData);
      
      const { data } = await axios.post('/api/address/add', requestData);
      
      console.log('API Response:', data);

      if (data.success) {
        toast.success(data.message || 'Address added successfully!');
        navigate("/cart");
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('=== API ERROR DETAILS ===');
      console.error('Full Error:', error);
      console.error('Response Data:', error.response?.data);
      console.error('Status Code:', error.response?.status);
      
      let errorMessage = 'Failed to add address';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
       
        localStorage.removeItem('token');
        navigate('/login');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('User in AddAddress:', user);
    
    if (!user) {
      console.log('No user found, checking authentication...');
      // Try to fetch user again
      fetchUser().then(updatedUser => {
        if (!updatedUser) {
          toast.error('Please login to continue');
          navigate("/login");
        }
      });
    }
  }, [user, navigate, fetchUser]);

  return (
    <>
      <div className="mt-10 pb-16">
        <p className="text-2xl md:text-3xl text-gray-500">
          Add Shipping <span className="font-semibold text-primary">Address</span>
        </p>

        {user && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              Logged in as: {user.email || user.name} | User ID: {user._id ? user._id : 'Not available'}
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
          <div className="flex-1 max-w-md">
            <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="firstname" 
                  type="text" 
                  placeholder="Enter First Name" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="lastname" 
                  type="text" 
                  placeholder="Enter Last Name" 
                />
              </div>
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="email" 
                type="email" 
                placeholder="Enter Email" 
              />
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="street" 
                type="text" 
                placeholder="Street Address" 
              />
              
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="city" 
                  type="text" 
                  placeholder="City" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="state" 
                  type="text" 
                  placeholder="State" 
                />
              </div>
              
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="zipcode" 
                  type="number" 
                  placeholder="Zip Code" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="country" 
                  type="text" 
                  placeholder="Country" 
                />
              </div>
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="phone" 
                type="tel" 
                placeholder="Phone Number" 
              />

              <button 
                type="submit" 
                disabled={loading || !user || !user._id}
                className={`w-full mt-6 py-3 hover:bg-primary-dull transition uppercase ${
                  loading || !user || !user._id
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary text-white cursor-pointer'
                }`}
              >
                {loading ? 'Adding Address...' : 'Save Address'}
              </button>
            </form>
          </div>

          <img
            className="md:mr-16 mb-16 md:mt-0 w-full max-w-sm"
            src={assets.add_address_iamge}
            alt="Add Address Illustration"
          />
        </div>
      </div>
    </>
  );
}

export default Addaddress;