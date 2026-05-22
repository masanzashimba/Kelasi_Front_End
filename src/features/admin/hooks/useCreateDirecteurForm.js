import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDirecteurSchema } from "../schemas/directeur.schema";
import { useAdmin } from "./useAdmin";

export const useCreateDirecteurForm = (onSuccess) => {
  const { createNewDirecteur, loading } = useAdmin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(createDirecteurSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      numDecision: "",
      envoyerEmail: true,
    },
  });

  const onSubmit = async (data) => {
    const result = await createNewDirecteur(data);

    if (result.success) {
      reset();
      if (onSuccess) {
        onSuccess(result.data);
      }
    }

    return result;
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isSubmitting || loading,
    reset,
    watch,
  };
};
