"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.scss';

type Step = 'IDENTIFICATION' | 'MFA' | 'DOCUMENT' | 'CONTACT' | 'ADDRESS' | 'SUCCESS';

interface IdentificationFormData { name: string; email: string; }
interface MfaFormData { code: string; }

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('IDENTIFICATION');
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  
  const [userEmail, setUserEmail] = useState<string>(''); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register: registerId, handleSubmit: handleIdSubmit, formState: { errors: idErrors } } = useForm<IdentificationFormData>();
  
  const { register: registerMfa, handleSubmit: handleMfaSubmit, formState: { errors: mfaErrors } } = useForm<MfaFormData>();

  const onSubmitIdentification = async (data: IdentificationFormData) => {
    setIsLoading(true);
    setGlobalError(null);
    setUserEmail(data.email); 
    
    try {
      const response = await api.startRegistration(data);
      if (response.requireMfa) {
        setCurrentStep('MFA');
      } else {
        setRegistrationId(response.registrationId);
        setCurrentStep('DOCUMENT');
      }
    } catch (error: any) {
      setGlobalError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitMfa = async (data: MfaFormData) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const response = await api.verifyMfa({ email: userEmail, code: data.code });
      
      setRegistrationId(response.registrationId);
      setCurrentStep(response.currentStep); 
      
    } catch (error: any) {
      setGlobalError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.wizardContainer}>
      
      {currentStep === 'IDENTIFICATION' && (
        <form onSubmit={handleIdSubmit(onSubmitIdentification)}>
          <h1>Bem-vindo!</h1>
          <p>Vamos iniciar o seu cadastro.</p>
          <Input label="Nome Completo" placeholder="Digite seu nome" {...registerId('name', { required: 'O nome é obrigatório' })} error={idErrors.name?.message} />
          <Input label="E-mail" type="email" placeholder="seu@email.com" {...registerId('email', { required: 'O e-mail é obrigatório' })} error={idErrors.email?.message} />
          {globalError && <span style={{ color: 'red', display: 'block', marginBottom: '1rem' }}>{globalError}</span>}
          <Button type="submit" isLoading={isLoading}>Começar</Button>
        </form>
      )}

      {currentStep === 'MFA' && (
        <form onSubmit={handleMfaSubmit(onSubmitMfa)}>
          <h1>Bem-vindo de volta!</h1>
          <p>Vimos que você já tinha começado. Enviamos um código de 6 dígitos para <b>{userEmail}</b>.</p>
          
          <Input 
            label="Código de Verificação" 
            placeholder="000000" 
            maxLength={6}
            {...registerMfa('code', { 
              required: 'O código é obrigatório', 
              minLength: { value: 6, message: 'O código tem 6 dígitos' },
              maxLength: { value: 6, message: 'O código tem 6 dígitos' }
            })} 
            error={mfaErrors.code?.message} 
          />
          
          {globalError && <span style={{ color: 'red', display: 'block', marginBottom: '1rem' }}>{globalError}</span>}
          <Button type="submit" isLoading={isLoading}>Validar Código</Button>
        </form>
      )}

      {currentStep === 'DOCUMENT' && <h1>Tela de Documento (Em construção)</h1>}
    </main>
  );
}