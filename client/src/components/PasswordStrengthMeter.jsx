const PasswordStrengthMeter = ({ password }) => {
    const getStrength = (pass) => {
        if (!pass) return 0;
        
        // Simple strength calculation
        let strength = 0;
        if (pass.length > 5) strength += 1;
        if (pass.length > 8) strength += 1;
        if (/[A-Z]/.test(pass)) strength += 1;
        if (/[0-9]/.test(pass)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
        
        return Math.min(strength, 5);
    };
    
    const strength = getStrength(password);
    const strengthText = ['Very Weak', 'Weak', 'Okay', 'Good', 'Strong', 'Very Strong'][strength];
    const strengthColor = [
        'bg-red-500', 
        'bg-orange-500', 
        'bg-yellow-500', 
        'bg-blue-500', 
        'bg-green-500', 
        'bg-green-600'
    ][strength];
    
    return (
        <div className="mt-1">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                        key={i} 
                        className={`h-1 flex-1 mr-1 rounded-full ${i <= strength ? strengthColor : 'bg-gray-200'}`}
                    />
                ))}
            </div>
            {password && (
                <p className={`text-xs mt-1 ${strength < 2 ? 'text-red-500' : strength < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                    Strength: {strengthText}
                </p>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;