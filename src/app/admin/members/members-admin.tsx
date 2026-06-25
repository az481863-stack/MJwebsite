"use client";

// 會員管理互動區:邀請表單 + 會員列表(每列為獨立 MemberRow,各自管理 action 狀態)。

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  changeRole,
  disableMember,
  inviteMember,
  resendInvite,
  restoreMember,
  type ActionResult,
} from "./actions";

interface MemberRow {
  id: string;
  loginEmail: string;
  role: "STUDENT" | "ADMIN" | "SUPERADMIN";
  status: "PENDING" | "ACTIVE" | "DISABLED";
}

const ROLE_LABEL = {
  STUDENT: "學生",
  ADMIN: "管理員",
  SUPERADMIN: "最高權限者",
} as const;

const STATUS_LABEL = {
  PENDING: "待啟用",
  ACTIVE: "已啟用",
  DISABLED: "已停用",
} as const;

function Msg({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>
      {state.message}
    </p>
  );
}

export function MembersAdmin({
  myId,
  canManageRoles,
  superadminCount,
  members,
}: {
  myId: string;
  canManageRoles: boolean;
  superadminCount: number;
  members: MemberRow[];
}) {
  const [inviteState, inviteAction, invitePending] = useActionState<
    ActionResult | null,
    FormData
  >(inviteMember, null);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">會員管理</h1>
        <p className="mt-1 text-sm text-muted">
          邀請成員、管理角色與帳號狀態。
        </p>
      </header>

      {/* 邀請 */}
      <section className="border border-line p-6">
        <h2 className="text-lg font-semibold">邀請新成員</h2>
        <form
          action={inviteAction}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium" htmlFor="invite-email">
              Email
            </label>
            <input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="invitee@example.com"
              className="mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
            />
          </div>
          {canManageRoles && (
            <div>
              <label className="block text-sm font-medium" htmlFor="invite-role">
                角色
              </label>
              <select
                id="invite-role"
                name="role"
                defaultValue="STUDENT"
                className="mt-1.5 border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
              >
                <option value="STUDENT">學生</option>
                <option value="ADMIN">管理員</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={invitePending}
            className="bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {invitePending ? "送出中…" : "送出邀請"}
          </button>
        </form>
        {!canManageRoles && (
          <p className="mt-3 text-xs text-muted">
            管理員邀請的成員一律為「學生」。
          </p>
        )}
        <div className="mt-3">
          <Msg state={inviteState} />
        </div>
      </section>

      {/* 列表 */}
      <section>
        <h2 className="text-lg font-semibold">成員列表</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {members.map((m) => (
            <MemberRowItem
              key={m.id}
              member={m}
              isSelf={m.id === myId}
              canManageRoles={canManageRoles}
              isLastSuperadmin={
                m.role === "SUPERADMIN" && superadminCount <= 1
              }
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function MemberRowItem({
  member,
  isSelf,
  canManageRoles,
  isLastSuperadmin,
}: {
  member: MemberRow;
  isSelf: boolean;
  canManageRoles: boolean;
  isLastSuperadmin: boolean;
}) {
  const router = useRouter();
  const [roleState, roleAction] = useActionState<ActionResult | null, FormData>(
    changeRole,
    null,
  );
  const [statusState, disableAction] = useActionState<
    ActionResult | null,
    FormData
  >(disableMember, null);
  const [restoreState, restoreAction] = useActionState<
    ActionResult | null,
    FormData
  >(restoreMember, null);
  const [resendState, resendAction] = useActionState<
    ActionResult | null,
    FormData
  >(resendInvite, null);

  // 角色下拉:受控,避免 React 19 在 action 完成後把表單重設回舊的 defaultValue。
  const [role, setRole] = useState<MemberRow["role"]>(member.role);
  // server 端資料刷新後同步顯示值(render 期間調整,避免 set-state-in-effect)。
  const [seenRole, setSeenRole] = useState<MemberRow["role"]>(member.role);
  if (seenRole !== member.role) {
    setSeenRole(member.role);
    setRole(member.role);
  }

  // 任一操作成功後強制刷新 server components,讓列表角色/狀態/可用按鈕即時更新。
  useEffect(() => {
    if (
      roleState?.ok ||
      statusState?.ok ||
      restoreState?.ok ||
      resendState?.ok
    ) {
      router.refresh();
    }
  }, [roleState, statusState, restoreState, resendState, router]);

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{member.loginEmail}</p>
        <p className="mt-0.5 text-xs text-muted">
          {ROLE_LABEL[member.role]} · {STATUS_LABEL[member.status]}
          {isSelf && " · 你"}
        </p>
        <div className="mt-1 space-y-0.5">
          <Msg state={roleState} />
          <Msg state={statusState} />
          <Msg state={restoreState} />
          <Msg state={resendState} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* 改角色(僅最高權限者;最後一位最高權限者不可降級)*/}
        {canManageRoles && !isSelf && (
          <form action={roleAction} className="flex items-center gap-1.5">
            <input type="hidden" name="memberId" value={member.id} />
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRow["role"])}
              disabled={isLastSuperadmin}
              className="border border-line px-2 py-1.5 text-xs outline-none focus:border-line-strong disabled:opacity-50"
            >
              <option value="STUDENT">學生</option>
              <option value="ADMIN">管理員</option>
              <option value="SUPERADMIN">最高權限者</option>
            </select>
            <button
              type="submit"
              disabled={isLastSuperadmin}
              className="border border-line px-2.5 py-1.5 text-xs transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              套用
            </button>
          </form>
        )}

        {/* 重寄邀請(待啟用)*/}
        {member.status === "PENDING" && (
          <form action={resendAction}>
            <input type="hidden" name="memberId" value={member.id} />
            <button
              type="submit"
              className="border border-line px-2.5 py-1.5 text-xs transition-colors hover:bg-foreground hover:text-background"
            >
              重寄邀請
            </button>
          </form>
        )}

        {/* 停用 / 還原 */}
        {member.status === "DISABLED" ? (
          <form action={restoreAction}>
            <input type="hidden" name="memberId" value={member.id} />
            <button
              type="submit"
              className="border border-line px-2.5 py-1.5 text-xs transition-colors hover:bg-foreground hover:text-background"
            >
              還原
            </button>
          </form>
        ) : (
          !isSelf &&
          !isLastSuperadmin && (
            <form action={disableAction}>
              <input type="hidden" name="memberId" value={member.id} />
              <button
                type="submit"
                className="border border-line px-2.5 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-600 hover:text-background"
              >
                停用
              </button>
            </form>
          )
        )}
      </div>
    </li>
  );
}
