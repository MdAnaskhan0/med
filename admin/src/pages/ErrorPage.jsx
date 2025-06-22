import React from 'react';
import { FaExclamationTriangle} from 'react-icons/fa';

const ErrorPage = () => {


    return (
        <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <FaExclamationTriangle className="text-red-500 text-4xl" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">404 - Page Not Found</h1>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;