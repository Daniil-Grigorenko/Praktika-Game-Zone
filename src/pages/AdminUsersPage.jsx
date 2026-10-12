import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getAllUsers, getAdminIds, getOwnerIds,
  setUserBlocked, grantAdmin, revokeAdmin, deleteUserData,
} from '../services/usersService';
import { formatDateTime } from '../utils/date';
import useDocumentTitle from '../hooks/useDocumentTitle';
import AdminTabs from '../components/admin/AdminTabs';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusMessage from '../components/common/StatusMessage';
import Spinner from '../components/common/Spinner';
import styles from './AdminUsersPage.module.css';

const ACTIONS = {
  grant:   { title: 'Назначить администратором?', confirm: 'Назначить',
             text: (u) => `${u.email} получит доступ к управлению зонами и блокировке пользователей.` },
  revoke:  { title: 'Снять права администратора?', confirm: 'Снять права',
             text: (u) => `${u.email} станет обычным пользователем.` },
  block:   { title: 'Заблокировать пользователя?', confirm: 'Заблокировать',
             text: (u) => `${u.email} сможет войти, но не сможет создавать и менять брони. Существующие брони останутся.` },
  unblock: { title: 'Разблокировать пользователя?', confirm: 'Разблокировать',
             text: (u) => `${u.email} снова сможет бронировать.` },
  delete:  { title: 'Удалить пользователя?', confirm: 'Удалить',
             text: (u) => `Профиль, все брони и права ${u.email} будут удалены, войти на сайт он больше не сможет. Действие нельзя отменить из интерфейса. Сам аккаунт останется в Firebase Authentication.` },
};

export default function AdminUsersPage() {
  useDocumentTitle('Пользователи');

  const { user: me, isOwner: iAmOwner } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [adminIds, setAdminIds] = useState(new Set());
  const [ownerIds, setOwnerIds] = useState(new Set());
  const [status, setStatus] = useState('loading'); // loading | error | success
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all | owner | admin | user | blocked

  const [pending, setPending] = useState(null); // { type, user }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');

    Promise.all([getAllUsers(), getAdminIds(), getOwnerIds()])
      .then(([list, admins, owners]) => {
        if (ignore) return;
        list.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
        setUsers(list);
        setAdminIds(admins);
        setOwnerIds(owners);
        setStatus('success');
      })
      .catch(() => { if (!ignore) setStatus('error'); });

    return () => { ignore = true; };
  }, [reloadKey]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => adminIds.has(u.id) && !ownerIds.has(u.id)).length,
    blocked: users.filter((u) => u.blocked).length,
  }), [users, adminIds, ownerIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const isOwnerUser = ownerIds.has(u.id);
      const isAdminUser = adminIds.has(u.id) && !isOwnerUser;
      if (q && !u.email.toLowerCase().includes(q) && !u.displayName.toLowerCase().includes(q)) return false;
      if (roleFilter === 'owner' && !isOwnerUser) return false;
      if (roleFilter === 'admin' && !isAdminUser) return false;
      if (roleFilter === 'user' && (isOwnerUser || isAdminUser)) return false;
      if (roleFilter === 'blocked' && !u.blocked) return false;
      return true;
    });
  }, [users, adminIds, ownerIds, search, roleFilter]);

  async function handleConfirm() {
    const { type, user } = pending;
    setBusy(true);
    try {
      if (type === 'grant') {
        await grantAdmin(user.id);
        setAdminIds((prev) => new Set(prev).add(user.id));
        toast.success('Администратор назначен');
      } else if (type === 'revoke') {
        await revokeAdmin(user.id);
        setAdminIds((prev) => { const next = new Set(prev); next.delete(user.id); return next; });
        toast.success('Права администратора сняты');
      } else if (type === 'delete') {
        await deleteUserData(user, me.uid);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setAdminIds((prev) => { const next = new Set(prev); next.delete(user.id); return next; });
        toast.success('Пользователь удалён');
      } else {
        const blocked = type === 'block';
        await setUserBlocked(user.id, blocked);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, blocked } : u)));
        toast.success(blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
      }
    } catch (err) {
      console.error(err);
      toast.error('Не удалось выполнить действие. Проверьте права доступа.');
    } finally {
      setPending(null);
      setBusy(false);
    }
  }

  return (
    <section>
      <AdminTabs />
      <h1>Пользователи</h1>

      {status === 'loading' && <Spinner />}

      {status === 'error' && (
        <StatusMessage
          title="Не удалось загрузить пользователей"
          text="Проверьте, что опубликованы новые правила безопасности."
          actionLabel="Повторить"
          onAction={() => setReloadKey((k) => k + 1)}
        />
      )}

      {status === 'success' && (
        <>
          <div className={styles.stats}>
            <div><strong>{stats.total}</strong><span>всего</span></div>
            <div><strong>{stats.admins}</strong><span>админов</span></div>
            <div><strong>{stats.blocked}</strong><span>заблокировано</span></div>
          </div>

          <div className={styles.filters}>
            <input
              type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени или email" aria-label="Поиск пользователя"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Фильтр">
              <option value="all">Все</option>
              <option value="owner">Владельцы</option>
              <option value="admin">Администраторы</option>
              <option value="user">Пользователи</option>
              <option value="blocked">Заблокированные</option>
            </select>
          </div>

          {users.length === 0 && (
            <StatusMessage
              title="Пока нет пользователей в списке"
              text="Пользователи появляются здесь после регистрации или следующего входа на сайт."
            />
          )}

          {users.length > 0 && filtered.length === 0 && (
            <StatusMessage title="Никого не найдено" text="Измените поиск или фильтр." />
          )}

          <div className={styles.list}>
            {filtered.map((u) => {
              const isOwnerUser = ownerIds.has(u.id);
              const isAdminUser = adminIds.has(u.id) && !isOwnerUser;
              const isMe = u.id === me.uid;

              const canManage = !isMe && !isOwnerUser;
              const canChangeRole = canManage && iAmOwner;
              const canBlock = canManage && !isAdminUser;
              const canDelete = canManage && iAmOwner;

              return (
                <article key={u.id} className={styles.card}>
                  <div className={styles.avatar} aria-hidden="true">
                    {(u.displayName || u.email || '?')[0].toUpperCase()}
                  </div>

                  <div className={styles.info}>
                    <h3>
                      {u.displayName || 'Без имени'}
                      {isMe && <span className={styles.me}>это вы</span>}
                      {isOwnerUser && <span className={styles.owner}>Владелец</span>}
                      {isAdminUser && <span className={styles.admin}>Админ</span>}
                      {u.blocked && <span className={styles.blocked}>Заблокирован</span>}
                    </h3>
                    <p className={styles.email}>{u.email}</p>
                    <p className={styles.meta}>Регистрация: {formatDateTime(u.createdAt)}</p>
                    <p className={styles.meta}>Последний вход: {formatDateTime(u.lastLoginAt)}</p>
                  </div>

                  {(canChangeRole || canBlock || canDelete) && (
                    <div className={styles.actions}>
                      {canChangeRole && (
                        <button
                          type="button"
                          onClick={() => setPending({ type: isAdminUser ? 'revoke' : 'grant', user: u })}
                        >
                          {isAdminUser ? 'Снять админа' : 'Сделать админом'}
                        </button>
                      )}
                      {canBlock && (
                        <button
                          type="button"
                          className={u.blocked ? '' : styles.danger}
                          onClick={() => setPending({ type: u.blocked ? 'unblock' : 'block', user: u })}
                        >
                          {u.blocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className={styles.danger}
                          onClick={() => setPending({ type: 'delete', user: u })}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      {pending && (
        <ConfirmDialog
          title={ACTIONS[pending.type].title}
          text={ACTIONS[pending.type].text(pending.user)}
          confirmLabel={ACTIONS[pending.type].confirm}
          loadingLabel="Выполняем…"
          loading={busy}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </section>
  );
}