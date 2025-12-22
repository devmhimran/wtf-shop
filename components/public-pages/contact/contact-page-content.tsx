'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { emailApi } from '@/lib/api-helper';

import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Loader2Icon, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(5, { message: 'Email must be at least 5 characters long' }),
  subject: z.string().min(3, {
    message: 'Subject must be at least 3 characters.',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters.',
  }),
});

export function ContactPageContent() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsPending(true);
    const response = emailApi.contactForm({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    toast.promise(response, {
      loading: 'Sending your message...',
      success: () => {
        setIsPending(false);
        form.reset();
        return 'Message sent successfully! We will get back to you soon.';
      },
      error: 'Failed to send message. Please try again.',
    });
  }
  return (
    <div className='min-h-screen bg-gray-50/50'>
      <div className='container mx-auto px-4 py-16 lg:py-24'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-4xl lg:text-5xl font-bold mb-4'>Get in Touch</h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Have a question or want to work together? We&apos;d love to hear
            from you.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto'>
          {/* Contact Information */}
          <div className='space-y-8'>
            <div>
              <h2 className='text-2xl font-semibold mb-6'>
                Contact Information
              </h2>
              <div className='space-y-6'>
                <div className='flex items-start gap-4 p-4 rounded-lg bg-card border'>
                  <div className='p-3 rounded-full bg-primary/10'>
                    <MapPin className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-medium mb-1'>Location</h3>
                    <p className='text-muted-foreground'>
                      54 John Street, Lilydale Vic 3140 Australia
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4 p-4 rounded-lg bg-card border'>
                  <div className='p-3 rounded-full bg-primary/10'>
                    <Mail className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-medium mb-1'>Email</h3>
                    <a
                      href='mailto:whatthefunk.au@gmail.com'
                      className='text-muted-foreground hover:text-primary transition-colors'
                    >
                      whatthefunk.au@gmail.com
                    </a>
                  </div>
                </div>

                <div className='flex items-start gap-4 p-4 rounded-lg bg-card border'>
                  <div className='p-3 rounded-full bg-primary/10'>
                    <Clock className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-medium mb-1'>Opening Hours</h3>
                    <p className='text-muted-foreground'>By appointment</p>
                    <p className='text-muted-foreground'>Online 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='p-6 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20'>
              <h3 className='text-xl font-semibold mb-2'>Why Choose Us?</h3>
              <p className='text-muted-foreground'>
                We&apos;re committed to providing exceptional service and quick
                responses to all inquiries. Whether you need support or have a
                question, we&apos;re here to help.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className='bg-card p-8 rounded-lg border shadow-sm'>
            <h2 className='text-2xl font-semibold mb-6'>Send us a Message</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Your name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='your.email@example.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='subject'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder='What is this about?' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='message'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell us more about your inquiry...'
                          className='h-[150px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type='submit' className='w-full' disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
