"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.scss';

type Step = 'IDENTIFICATION' | 'MFA' | 'DOCUMENT' | 'CONTACT' | 'ADDRESS' | 'SUCCESS';

interface IdentificationFormData {
  name: string;
  email: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('IDENTIFICATION');
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<IdentificationFormData>();

  const onSubmitIdentification = async (data: IdentificationFormData) => {
    setIsLoading(true);
    setGlobalError(null);
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

  return (
    <main className={styles.wizardContainer}>
      {currentStep === 'IDENTIFICATION' && (
        <form onSubmit={handleSubmit(onSubmitIdentification)}>
          <h1>Bem-vindo!</h1>
          <p>Vamos iniciar o seu cadastro.</p>

          <Input
            label="Nome Completo"
            placeholder="Digite seu nome"
            {...register('name', { required: 'O nome é obrigatório', minLength: { value: 3, message: 'Mínimo de 3 caracteres' } })}
            error={errors.name?.message}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            {...register('email', { 
              required: 'O e-mail é obrigatório',
              pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido' }
            })}
            error={errors.email?.message}
          />

          {globalError && <span style={{ color: 'red', fontSize: '0.875rem', display: 'block', marginBottom: '1rem' }}>{globalError}</span>}

          <Button type="submit" isLoading={isLoading}>
            Começar
          </Button>
        </form>
      )}

      {currentStep === 'MFA' && <h1>Tela de MFA (Em construção)</h1>}
      {currentStep === 'DOCUMENT' && <h1>Tela de Documento (Em construção)</h1>}

    </main>
  );
}