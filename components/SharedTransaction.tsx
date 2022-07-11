import theme from "@/styles/theme";
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";
import { forwardRef, useEffect, useState } from "react";
import { Transaction as TransactionType } from "plaid";

export const SharedTransaction = forwardRef(({ transaction, groupUsers, ...props }: { transaction: TransactionType; groupUsers: any; props?: any }, ref) => {
    return (
        <div
            className={"p-3 rounded-md bg-gray-900 cursor-pointer grid grid-cols-1 gap-0.5 text-sm"}
            {...props}
            ref={ref}
        >
            <div className={"flex justify-between items-center"}>
                <div className={"grid grid-cols-[auto_auto] gap-2 items-center"}>
                    <Avatar.Root>
                        <Avatar.Image />
                        <Avatar.Fallback>
                            <DefaultAvatar
                                size={16}
                                name={
                                    groupUsers.find((user: any) => user.profile_id === transaction.charged_to)["profiles"]["username"]
                                }
                                variant="beam"
                                colors={theme.colors.avatar} />
                        </Avatar.Fallback>
                    </Avatar.Root>
                    <div className={"font-medium"}>{transaction.merchant_name}</div>
                </div>
                <div className={"font-mono font-medium tracking-tight"}>${transaction?.amount?.toFixed(2)}</div>
            </div>
            <div className={"flex justify-between"}>
                <div className={"text-gray-600"}>{transaction.name}</div>
                <div className={"font-mono font-medium tracking-tight text-gray-600"}>{transaction.date}</div>
            </div>
        </div>
    );
});