import React, { useState } from 'react';
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProfileAvatar = ({ user, userId, baseUrl, onUpload }) => {
  const [userImage, setUserImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            if (blob.size > 1024 * 1024) {
              reject(new Error('File size exceeds 1MB after resizing'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.9
        );
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const resizedBlob = await resizeImage(file);

      const formData = new FormData();
      formData.append('image', resizedBlob, file.name);

      await axios.post(`${baseUrl}/profile-image/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFileInputKey(Date.now());
      onUpload();
      toast.success('Profile image updated successfully');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) return;

    try {
      await axios.delete(`${baseUrl}/profile-image/${userId}`);
      setUserImage(null);
      setFileInputKey(Date.now());
      onUpload();
      toast.success('Profile image deleted successfully');
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('Failed to delete profile image');
    }
  };

  // Fetch image when component mounts or userId changes
  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`${baseUrl}/profile-image/${userId}`, {
          responseType: 'blob'
        });

        if (response.data) {
          const imageUrl = URL.createObjectURL(response.data);
          setUserImage(imageUrl);
        }
      } catch (err) {
        console.error('Error fetching user image:', err);
        setUserImage(null);
      }
    };

    if (userId) {
      fetchImage();
    }
  }, [userId, fileInputKey]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">Profile Photo</h3>
      </div>
      <div className="p-4 flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full border-4 border-white bg-white shadow-md mb-4 overflow-hidden">
          {userImage ? (
            <img
              src={userImage}
              alt="User Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl font-bold">
              {getInitials(user?.Name)}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 w-full">
          <label
            htmlFor="profile-upload"
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg cursor-pointer ${
              isUploading
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FiCamera size={16} />
            <span>{isUploading ? 'Uploading...' : 'Change'}</span>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
              key={fileInputKey}
            />
          </label>
          <button
            onClick={handleDelete}
            disabled={!userImage || isUploading}
            className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg ${
              !userImage || isUploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            <FiTrash2 size={16} />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatar;