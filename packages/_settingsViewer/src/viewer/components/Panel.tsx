import * as React from 'react';

interface Props {
    className?: string;
}

export function Panel(props: React.PropsWithChildren<Props>) {
    return <div className={props.className}>{props.children}</div>;
}
