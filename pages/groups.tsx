import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { displayAmount } from "@/components/Amount";

export default function Groups() {
    const profile_id = supabase.auth.session()?.user?.id;

    const amountTotal = -2200;
    const userGroups = [
        {
            name: "NA Tour",
            amount: -2400,
            update: "2 new transactions posted",
        },
        {
            name: "EU Tour",
            amount: 200,
            update: "No new transactions",
        },
    ];

    return (
        <div className="flex flex-col justify-between">
            <div className="flex flex-col items-center">
                <div className="text-lg">{amountTotal < 0 ? "You owe" : "Your pending refund"}</div>
                <div className="pt-2 text-4xl">{displayAmount(amountTotal)}</div>
            </div>
            <div className="pt-20">
                <div className="text-lg text-gray-300">Your groups</div>
            </div>
            <div className="pt-6">
                {userGroups.length > 0 ?
                    <div className="flex flex-col">
                        {userGroups.map((group) => (
                            <div key={group.name} className="flex pt-5">
                                <div className="flex-initial pr-1">Avatar</div>
                                <div className="flex-grow flex flex-col">
                                    <div className="text-xl">{group.name}</div>
                                    <div className="text-sm">{group.update}</div>
                                </div>
                                <div className="text-xl text-right">{displayAmount(group.amount)}</div>
                            </div>
                        ))}
                    </div>
                    : <div>You are currently not in any groups</div>}
            </div>

            <div>

            </div>
        </div>
    );
}