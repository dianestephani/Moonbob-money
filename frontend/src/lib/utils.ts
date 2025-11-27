import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalString.slice(0, 4).replace(/0+$/, '');

  if (trimmedFractional === '') {
    return wholePart.toString();
  }

  return `${wholePart}.${trimmedFractional}`;
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
