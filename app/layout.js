import './globals.css';
import Head from 'next/head';
import FormWrapper from '../components/forms/FormWrapper';
import AuthForm from '../components/forms/AuthForm/AuthForm';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>Farm</title>
      </Head> 
      <body>
        <FormWrapper formName='Login'>
          <AuthForm />
        </FormWrapper>
        <div>
          {children}
        </div>
      </body>
    </html>
  )
}
