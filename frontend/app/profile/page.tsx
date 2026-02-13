"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateProfile, uploadAvatar, changePassword } from "@/lib/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Camera, Loader2, Save, User, Lock, CreditCard } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import { SubscriptionTab } from "@/components/profile/SubscriptionTab";

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
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

        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecione um arquivo de imagem.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            await uploadAvatar(file);
            toast.success("Foto de perfil atualizada!");
            await refreshUser();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar foto.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Por favor, preencha o nome.");
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({ name });
            toast.success("Perfil atualizado com sucesso!");
            await refreshUser();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("A nova senha e a confirmação não coincidem.");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setIsPasswordLoading(true);
        try {
            await changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Senha alterada com sucesso!");
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: unknown) {
            console.error(error);
            const axiosError = error as { response?: { data?: { message?: string } } };
            const msg = axiosError.response?.data?.message || "Erro ao alterar senha.";
            toast.error(msg);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    if (!user) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container max-w-4xl py-10">
            <h1 className="text-3xl font-bold mb-8">Configurações da Conta</h1>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="profile">
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="subscription">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Assinatura
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
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
                                            <AvatarImage src={getAvatarUrl(user.avatar)} />
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Segurança</CardTitle>
                                <CardDescription>Atualize sua senha de acesso.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">Nova Senha</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                                placeholder="Mínimo 6 caracteres"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                                placeholder="Confirme a nova senha"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="oldPassword">Senha Atual</Label>
                                        <Input
                                            id="oldPassword"
                                            type="password"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                                            placeholder="Necessário para validar a troca"
                                            required
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit" disabled={isPasswordLoading} variant="outline">
                                            {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Lock className="mr-2 h-4 w-4" />
                                            Alterar Senha
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="subscription">
                    <SubscriptionTab userId={user.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
