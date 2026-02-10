"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateProfile, uploadAvatar } from "@/lib/api/user"; // Need to create/export this
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Loader2, Save, User } from "lucide-react";


export default function ProfilePage() {
    const { user } = useAuth(); // login aqui serve para atualizar o user no contexto se mudar
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
        }
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await uploadAvatar(file);
            toast.success("Foto de perfil atualizada!");
            // Atualizar contexto local (hack: chamar login com token existente atualiza user?) 
            // Não, precisamos de um método 'refreshUser' no AuthContext ou atualizar manualmente.
            // Por enquanto, reload na página ou confiar que o backend retorna o user atualizado e setamos algo local?
            // O ideal é o useAuth expor um mutate ou refresh.
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar foto.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile({ name });
            toast.success("Perfil atualizado com sucesso!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                        <CardDescription>Gerencie suas informações pessoais e foto de perfil.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                    <AvatarImage src={user.avatar || ""} />
                                    <AvatarFallback className="text-4xl">
                                        {user.name?.charAt(0).toUpperCase() || <User className="h-12 w-12" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-sm text-muted-foreground">
                                Clique na foto para alterar
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user.email} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
