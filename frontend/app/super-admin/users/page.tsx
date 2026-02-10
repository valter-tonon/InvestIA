"use client";

import { useCallback, useEffect, useState } from "react";
import { listUsers, AdminUser, updateUserRole, suspendUser, reactivateUser, deleteUser } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { Search, UserCog, Ban, CheckCircle, Trash2 } from "lucide-react";

export default function UsersManagementPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: 'role' | 'suspend' | 'reactivate' | 'delete' | null;
        newRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    }>({ open: false, type: null });

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = { page, perPage: 20 };
            if (search) params.search = search;
            if (roleFilter !== 'all') params.role = roleFilter;

            const response = await listUsers(params);
            setUsers(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleAction = async () => {
        if (!selectedUser || !actionDialog.type) return;

        try {
            switch (actionDialog.type) {
                case 'role':
                    if (actionDialog.newRole) {
                        await updateUserRole(selectedUser.id, actionDialog.newRole);
                        toast.success('Role atualizada com sucesso');
                    }
                    break;
                case 'suspend':
                    await suspendUser(selectedUser.id);
                    toast.success('Usuário suspenso');
                    break;
                case 'reactivate':
                    await reactivateUser(selectedUser.id);
                    toast.success('Usuário reativado');
                    break;
                case 'delete':
                    await deleteUser(selectedUser.id);
                    toast.success('Usuário deletado permanentemente');
                    break;
            }
            setActionDialog({ open: false, type: null });
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Erro ao executar ação');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'ADMIN': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    const getStatusBadge = (user: AdminUser) => {
        if (user.deleted_at) {
            return <Badge variant="outline" className="bg-red-500/10 text-red-500">Suspenso</Badge>;
        }
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">Ativo</Badge>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
                <p className="text-muted-foreground">
                    Gerencie usuários, roles e status
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={(value) => {
                        setRoleFilter(value);
                        setPage(1);
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as roles</SelectItem>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                            <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Usuários ({total})</CardTitle>
                    <CardDescription>
                        Lista de todos os usuários do sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner className="h-8 w-8 text-primary" />
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhum usuário encontrado
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium">Nome</th>
                                        <th className="text-left py-3 px-4 font-medium">Email</th>
                                        <th className="text-left py-3 px-4 font-medium">Role</th>
                                        <th className="text-left py-3 px-4 font-medium">Plano</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Cadastro</th>
                                        <th className="text-right py-3 px-4 font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="py-3 px-4">{user.name || '-'}</td>
                                            <td className="py-3 px-4 font-mono text-sm">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.subscription ? (
                                                    <Badge variant="outline">{user.subscription.plan.displayName}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">{getStatusBadge(user)}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setActionDialog({ open: true, type: 'role' });
                                                        }}
                                                        title="Alterar role"
                                                    >
                                                        <UserCog className="h-4 w-4" />
                                                    </Button>
                                                    {user.deleted_at ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setActionDialog({ open: true, type: 'reactivate' });
                                                            }}
                                                            title="Reativar"
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setActionDialog({ open: true, type: 'suspend' });
                                                            }}
                                                            title="Suspender"
                                                        >
                                                            <Ban className="h-4 w-4 text-orange-600" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setActionDialog({ open: true, type: 'delete' });
                                                        }}
                                                        title="Deletar permanentemente"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && users.length > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                Página {page} de {Math.ceil(total / 20)}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(total / 20)}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Dialogs */}
            <AlertDialog open={actionDialog.open && actionDialog.type === 'role'} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Alterar Role do Usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Selecione a nova role para {selectedUser?.email}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Select
                        value={actionDialog.newRole}
                        onValueChange={(value: string) => setActionDialog({ ...actionDialog, newRole: value as 'USER' | 'ADMIN' | 'SUPER_ADMIN' })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                            <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                        </SelectContent>
                    </Select>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAction} disabled={!actionDialog.newRole}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={actionDialog.open && actionDialog.type === 'suspend'} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Suspender Usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja suspender {selectedUser?.email}? O usuário não poderá mais acessar o sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAction} className="bg-orange-600 hover:bg-orange-700">
                            Suspender
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={actionDialog.open && actionDialog.type === 'reactivate'} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reativar Usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja reativar {selectedUser?.email}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAction} className="bg-green-600 hover:bg-green-700">
                            Reativar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={actionDialog.open && actionDialog.type === 'delete'} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Usuário Permanentemente</AlertDialogTitle>
                        <AlertDialogDescription>
                            ATENÇÃO: Esta ação é irreversível! Todos os dados de {selectedUser?.email} serão permanentemente deletados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAction} className="bg-red-600 hover:bg-red-700">
                            Deletar Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
