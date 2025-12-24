'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { authApi } from '@/lib/api-helper';
import { getErrorMessage } from '@/lib/utils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type EnterOtpFormProps = {
  setMatchOtp: (value: boolean) => void;
  setOtp: (value: string) => void;
  email: string;
};

export function EnterOtpForm({
  setMatchOtp,
  email,
  setOtp,
}: EnterOtpFormProps) {
  const [otpValue, setOtpValue] = useState('');

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);

  const isExpired = timeLeft <= 0;

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setIsPending(true);
    const response = authApi.otpVerify(email, otpValue);
    toast.promise(response, {
      loading: 'Verifying OTP...',
      success: () => {
        setMatchOtp(true);
        setIsPending(false);
        setOtp(otpValue);

        return 'OTP verified successfully!';
      },
      error: (err) => getErrorMessage(err) || 'Failed to verify OTP.',
    });
  };

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    if (error) {
      setError('');
    }
  };
  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Enter OTP</CardTitle>
        <CardDescription className=''>
          Please enter the 6-digit OTP sent to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Timer Display */}
        {!isExpired ? (
          <div className='text-center'>
            <p className='text-sm text-muted-foreground'>
              Time remaining:{' '}
              <span className='font-semibold text-orange-600'>
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>
        ) : (
          <div className='text-center'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Your verification code has expired.
                <a
                  href='/forgot-password'
                  className='ml-1 underline hover:no-underline text-orange-600'
                >
                  Request a new code
                </a>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className='space-y-2 flex justify-center'>
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={handleOtpChange}
            disabled={isPending || isExpired}
            className='justify-center bg-red-500'
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
        </div>

        <div className='space-y-3'>
          <Button
            onClick={handleVerifyOtp}
            disabled={isPending || otpValue.length !== 6 || isExpired}
            className='w-full'
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className='pt-2'>
            <a
              href='/forgot-password'
              className='text-sm hover:underline flex justify-center items-center gap-1 text-primary'
            >
              {isExpired ? 'Request New Code' : 'Back to Email Entry'}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
