export const formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export const displayAmount = (amount: number | bigint) => (
    <div className={amount < 0 ? "text-red-700" : "text-green-700"}>
        {amount > 0 ? "+" : null}
        {formatter.format(amount)}
    </div>
);