"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import { formatDocument, formatPhone, formatCep } from "@/utils/masks";
import styles from "./page.module.scss";

type Step =
  | "IDENTIFICATION"
  | "MFA"
  | "DOCUMENT"
  | "CONTACT"
  | "ADDRESS"
  | "REVIEW"
  | "SUCCESS";

interface IdentificationFormData {
  name: string;
  email: string;
}
interface MfaFormData {
  code: string;
}
interface DocumentFormData {
  document: string;
}
interface ContactFormData {
  phone: string;
}
interface AddressFormData {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
}

interface UserData {
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
  address?: AddressFormData;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("IDENTIFICATION");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({});

  const {
    register: registerId,
    handleSubmit: handleIdSubmit,
    formState: { errors: idErrors },
  } = useForm<IdentificationFormData>();
  const {
    register: registerMfa,
    handleSubmit: handleMfaSubmit,
    formState: { errors: mfaErrors },
  } = useForm<MfaFormData>();
  const {
    register: registerDoc,
    handleSubmit: handleDocSubmit,
    formState: { errors: docErrors },
    setValue: setDocValue,
  } = useForm<DocumentFormData>();
  const {
    register: registerContact,
    handleSubmit: handleContactSubmit,
    formState: { errors: contactErrors },
    setValue: setContactValue,
  } = useForm<ContactFormData>();

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    setValue: setAddressValue,
    setFocus,
  } = useForm<AddressFormData>();

  const onSubmitIdentification = async (data: IdentificationFormData) => {
    setIsLoading(true);
    setGlobalError(null);
    setUserEmail(data.email);
    setUserData((prev) => ({ ...prev, ...data }));
    try {
      const response = await api.startRegistration(data);
      if (response.requireMfa) {
        setCurrentStep("MFA");
      } else {
        setRegistrationId(response.registrationId);
        setCurrentStep("DOCUMENT");
      }
    } catch (error: unknown) {
      if (error instanceof Error) setGlobalError(error.message);
      else setGlobalError("Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitMfa = async (data: MfaFormData) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const response = await api.verifyMfa({
        email: userEmail,
        code: data.code,
      });
      setRegistrationId(response.registrationId);
      setCurrentStep(response.currentStep);
    } catch (error: unknown) {
      if (error instanceof Error) setGlobalError(error.message);
      else setGlobalError("Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitDocument = async (data: DocumentFormData) => {
    if (!registrationId) return;
    setIsLoading(true);
    setGlobalError(null);
    setUserData((prev) => ({ ...prev, ...data }));
    try {
      await api.updateDocument(registrationId, data.document);
      setCurrentStep("CONTACT");
    } catch (error: unknown) {
      if (error instanceof Error) setGlobalError(error.message);
      else setGlobalError("Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitContact = async (data: ContactFormData) => {
    if (!registrationId) return;
    setIsLoading(true);
    setGlobalError(null);
    setUserData((prev) => ({ ...prev, ...data }));
    try {
      await api.updateContact(registrationId, data.phone);
      setCurrentStep("ADDRESS");
    } catch (error: unknown) {
      if (error instanceof Error) setGlobalError(error.message);
      else setGlobalError("Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setAddressValue("street", data.logradouro);
        setAddressValue("neighborhood", data.bairro);
        setAddressValue("city", data.localidade);
        setAddressValue("state", data.uf);
        setFocus("number");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    }
  };

  const onSubmitAddress = async (data: AddressFormData) => {
    setUserData((prev) => ({ ...prev, address: data }));
    setCurrentStep('REVIEW');
  };

  const onFinalSubmit = async () => {
    if (!registrationId || !userData.address) return;
    setIsLoading(true); setGlobalError(null);
    try {
      await api.updateAddress(registrationId, {
        zipCode: userData.address.zipCode,
        number: userData.address.number,
        complement: userData.address.complement,
      });
      setCurrentStep('SUCCESS'); 
    } catch (error: unknown) { 
      if (error instanceof Error) setGlobalError(error.message);
      else setGlobalError("Ocorreu um erro desconhecido.");
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <main className={styles.wizardContainer}>
      
      {currentStep === "IDENTIFICATION" && (
        <form onSubmit={handleIdSubmit(onSubmitIdentification)}>
          {" "}
          <h1>Bem-vindo!</h1> <p>Vamos iniciar o seu cadastro.</p>{" "}
          <Input
            label="Nome Completo"
            placeholder="Digite seu nome"
            {...registerId("name", { required: "O nome é obrigatório" })}
            error={idErrors.name?.message}
          />{" "}
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            {...registerId("email", { required: "O e-mail é obrigatório" })}
            error={idErrors.email?.message}
          />{" "}
          {globalError && (
            <span
              style={{ color: "red", display: "block", marginBottom: "1rem" }}
            >
              {globalError}
            </span>
          )}{" "}
          <Button type="submit" isLoading={isLoading}>
            Começar
          </Button>{" "}
        </form>
      )}

      {currentStep === "MFA" && (
        <form onSubmit={handleMfaSubmit(onSubmitMfa)}>
          {" "}
          <h1>Bem-vindo de volta!</h1>{" "}
          <p>
            Vimos que você já tinha começado. Enviamos um código para{" "}
            <b>{userEmail}</b>.
          </p>{" "}
          <Input
            label="Código"
            placeholder="000000"
            maxLength={6}
            {...registerMfa("code", { required: "Obrigatório" })}
            error={mfaErrors.code?.message}
          />{" "}
          {globalError && (
            <span
              style={{ color: "red", display: "block", marginBottom: "1rem" }}
            >
              {globalError}
            </span>
          )}{" "}
          <Button type="submit" isLoading={isLoading}>
            Validar Código
          </Button>{" "}
        </form>
      )}

      {currentStep === "DOCUMENT" && (
        <form onSubmit={handleDocSubmit(onSubmitDocument)}>
          {" "}
          <h1>Seu Documento</h1> <p>Precisamos do seu CPF ou CNPJ.</p>{" "}
          <Input
            label="CPF ou CNPJ"
            placeholder="000.000.000-00"
            type="tel"
            {...registerDoc("document", {
              required: "Obrigatório",
              onChange: (e) =>
                setDocValue("document", formatDocument(e.target.value)),
            })}
            error={docErrors.document?.message}
          />{" "}
          {globalError && (
            <span
              style={{ color: "red", display: "block", marginBottom: "1rem" }}
            >
              {globalError}
            </span>
          )}{" "}
          <Button type="submit" isLoading={isLoading}>
            Continuar
          </Button>{" "}
        </form>
      )}

      {currentStep === "CONTACT" && (
        <form onSubmit={handleContactSubmit(onSubmitContact)}>
          {" "}
          <h1>Seu Contato</h1> <p>Qual o seu melhor número de celular?</p>{" "}
          <Input
            label="Celular"
            placeholder="(00) 00000-0000"
            type="tel"
            {...registerContact("phone", {
              required: "Obrigatório",
              onChange: (e) =>
                setContactValue("phone", formatPhone(e.target.value)),
            })}
            error={contactErrors.phone?.message}
          />{" "}
          {globalError && (
            <span
              style={{ color: "red", display: "block", marginBottom: "1rem" }}
            >
              {globalError}
            </span>
          )}{" "}
          <Button type="submit" isLoading={isLoading}>
            Continuar
          </Button>{" "}
        </form>
      )}

      {currentStep === "ADDRESS" && (
        <form onSubmit={handleAddressSubmit(onSubmitAddress)}>
          <h1>Endereço</h1>
          <p>Para onde enviaremos as novidades?</p>

          <Input
            label="CEP"
            placeholder="00000-000"
            type="tel"
            {...registerAddress("zipCode", {
              required: "O CEP é obrigatório",
              onChange: (e) =>
                setAddressValue("zipCode", formatCep(e.target.value)),
              onBlur: handleCepBlur,
            })}
            error={addressErrors.zipCode?.message}
          />

          <div className={`${styles.inputGroup} ${styles.rowStreet}`}>
            <div>
              <Input label="Rua" readOnly {...registerAddress("street")} />
            </div>
            <div>
              <Input
                label="Número"
                {...registerAddress("number", { required: "Obrigatório" })}
                error={addressErrors.number?.message}
              />
            </div>
          </div>

          <Input
            label="Complemento (Opcional)"
            placeholder="Apto 123, Bloco B..."
            {...registerAddress("complement")}
          />

          <div className={`${styles.inputGroup} ${styles.rowCity}`}>
            <div>
              <Input
                label="Bairro"
                readOnly
                {...registerAddress("neighborhood")}
              />
            </div>
            <div>
              <Input label="Cidade" readOnly {...registerAddress("city")} />
            </div>
            <div>
              <Input label="UF" readOnly {...registerAddress("state")} />
            </div>
          </div>

          {globalError && (
            <span
              style={{ color: "red", display: "block", marginBottom: "1rem" }}
            >
              {globalError}
            </span>
          )}
          <Button type="submit" isLoading={isLoading}>
            Concluir Cadastro
          </Button>
        </form>
      )}

      {currentStep === "REVIEW" && (
        <div>
          <h1>Revisão e Conclusão</h1>
          <p>Verifique se todos os seus dados estão corretos antes de finalizar.</p>
          
          <div style={{ backgroundColor: "#f7fafc", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            <p><strong>Nome:</strong> {userData.name}</p>
            <p><strong>E-mail:</strong> {userData.email}</p>
            <p><strong>Documento:</strong> {userData.document}</p>
            <p><strong>Celular:</strong> {userData.phone}</p>
            <hr style={{ margin: "1rem 0", borderColor: "#e2e8f0" }} />
            <p><strong>Endereço:</strong> {userData.address?.street}, {userData.address?.number} {userData.address?.complement ? `- ${userData.address.complement}` : ""}</p>
            <p><strong>Bairro:</strong> {userData.address?.neighborhood}</p>
            <p><strong>Cidade/UF:</strong> {userData.address?.city} / {userData.address?.state}</p>
            <p><strong>CEP:</strong> {userData.address?.zipCode}</p>
          </div>

          {globalError && <span style={{ color: "red", display: "block", marginBottom: "1rem" }}>{globalError}</span>}
          <Button onClick={onFinalSubmit} isLoading={isLoading}>
            Concluir Cadastro
          </Button>
        </div>
      )}

      {currentStep === "SUCCESS" && (
        <div style={{ textAlign: "center" }}>
          <h1
            style={{ color: "#0070f3", fontSize: "2rem", marginBottom: "1rem" }}
          >
            🎉 Sucesso!
          </h1>
          <p>
            Seu cadastro foi concluído e todos os dados foram salvos com
            segurança.
          </p>
          <Button
            onClick={() => window.location.reload()}
            style={{ marginTop: "2rem" }}
          >
            Fazer novo cadastro
          </Button>
        </div>
      )}
    </main>
  );
}
