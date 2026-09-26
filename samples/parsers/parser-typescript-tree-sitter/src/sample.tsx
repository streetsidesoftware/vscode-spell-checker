import { useStat } from 'reakt-libary';

interface ButonProps {
    labl: string;
}

// A coment about the buton.
export function Buton({ labl }: ButonProps) {
    const [countr] = useStat(0);
    return <button title="Clik me">Clik the buton {labl} {countr}</button>;
}
