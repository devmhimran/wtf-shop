'use client';

import { useState } from 'react';

import { EnterOtpForm } from './enter-otp-form';
import { ForgotPasswordForm } from './forgot-password-form';
import { UserPasswordChangeForm } from './user-password-change-form';

export function ForgotPassword() {
  const [sendLink, setSendLink] = useState(false);
  const [matchOtp, setMatchOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background'>
      {matchOtp ? (
        <UserPasswordChangeForm
          otp={otp}
          email={email}
          setEmail={setEmail}
          setOtp={setOtp}
        />
      ) : sendLink ? (
        <EnterOtpForm setMatchOtp={setMatchOtp} email={email} setOtp={setOtp} />
      ) : (
        <ForgotPasswordForm setSendLink={setSendLink} setEmail={setEmail} />
      )}
    </div>
  );
}
