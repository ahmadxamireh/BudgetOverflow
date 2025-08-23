import { type FormEvent, type JSX, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { addTransaction } from "./transactionsSlice";
import { updateTransaction } from "../../api/transactions";
import { type Transaction } from "../../models/Transaction";

interface Props {
    onClose: () => void;
    transactionToEdit?: Transaction | null;
    onSuccess?: () => void; // called after success to refresh parent state
}

export default function TransactionModal({ onClose, transactionToEdit, onSuccess }: Props): JSX.Element {
    const dispatch = useAppDispatch();
    const categories = useAppSelector((state) => state.categories.items);

    // form field states (initialised blank or from transactionToEdit)
    const [ title, setTitle ] = useState<string>("");
    const [ amount, setAmount ] = useState<number>(0);
    const [ type, setType ] = useState<"income" | "expense">("expense");
    const [ date, setDate ] = useState<string>("");
    const [ note, setNote ] = useState<string>("");
    const [ categoryId, setCategoryId ] = useState<number>(categories[0]?.id ?? 1);

    // populate form if editing
    useEffect(() => {
        const isoToDateInput = (iso: string): string => {
            return new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD
        };

        if (transactionToEdit) {
            setTitle(transactionToEdit.title);
            setAmount(transactionToEdit.amount);
            setType(transactionToEdit.type);
            setDate(isoToDateInput(transactionToEdit.date));
            setNote(transactionToEdit.note || "");
            setCategoryId(transactionToEdit.categoryId ?? categories[0]?.id ?? 1);
        } else {
            setDate(new Date().toLocaleDateString("en-CA"));
        }

        document.body.classList.add("overflow-hidden");
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [ transactionToEdit, categories ]);

    // submit handler
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (transactionToEdit) {
                await updateTransaction(transactionToEdit.id, {
                    title,
                    amount,
                    type,
                    date,
                    note: note.trim() || null,
                    categoryId
                });
            } else {
                await dispatch(
                    addTransaction({
                        title,
                        amount,
                        type,
                        date,
                        note: note.trim() || null,
                        categoryId
                    })
                );
            }

            if (onSuccess) onSuccess(); // trigger refresh
            onClose(); // close modal
        } catch (err) {
            console.error("Transaction save failed:", err);
            alert("Failed to save transaction.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.9)]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-center text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    { transactionToEdit ? "Update Transaction" : "Add Transaction" }
                </h3>

                <form onSubmit={ handleSubmit } className="space-y-4">
                    {/* title */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Title
                        </label>
                        <input
                            type="text"
                            value={ title }
                            onChange={ (e) => setTitle(e.target.value) }
                            required
                            className="w-full px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* amount */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={ amount }
                            onChange={ (e) => setAmount(Number(e.target.value)) }
                            required
                            className="w-full px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* type */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Type
                        </label>
                        <select
                            value={ type }
                            onChange={ (e) => setType(e.target.value as "income" | "expense") }
                            className="w-full px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    {/* date */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Date
                        </label>
                        <input
                            type="date"
                            value={ date }
                            onChange={ (e) => setDate(e.target.value) }
                            required
                            className="w-full px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* note */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Note
                        </label>
                        <textarea
                            value={ note }
                            onChange={ (e) => setNote(e.target.value) }
                            className="w-full px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* category */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Category
                        </label>
                        <select
                            value={ categoryId }
                            onChange={ (e) => setCategoryId(Number(e.target.value)) }
                            className="w-full px-3 py-2 rounded text-sm dark:bg-gray-700 dark:text-white"
                        >
                            { categories.map((cat) => (
                                <option key={ cat.id } value={ cat.id }>
                                    { cat.name }
                                </option>
                            )) }
                        </select>
                    </div>

                    {/* buttons */ }
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={ onClose }
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                        >
                            { transactionToEdit ? "Update" : "Add" }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}