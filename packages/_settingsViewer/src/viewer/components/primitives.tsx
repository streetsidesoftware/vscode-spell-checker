import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import List from '@material-ui/core/List';
import { createStyles, createTheme, makeStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import * as React from 'react';

import * as colors from './colors';

const maxWidth = '50em';

export const CsCheckBox = withStyles(
    createStyles({
        root: {
            color: colors.checkboxForeground,
            backgroundColor: colors.checkboxBackground,
        },
        colorPrimary: {},
        colorSecondary: {
            color: colors.checkboxForeground,
            backgroundColor: colors.checkboxBackground,
            '&$checked': {
                color: colors.checkboxForeground,
                backgroundColor: colors.checkboxBackground,
            },
            '&$disabled': {
                color: colors.checkboxForegroundDisabled,
                backgroundColor: colors.checkboxBackgroundDisabled,
                opacity: '0.6',
            },
        },
        disabled: {},
        checked: {},
    }),
)(Checkbox);

export const CsButton = withStyles(
    createStyles({
        root: {},
        containedPrimary: {
            color: colors.colorOnPrimary,
            background: colors.colorPrimary,
        },
        containedSecondary: {
            color: colors.colorOnSecondary,
            background: colors.colorSecondary,
        },
    }),
)(Button);

export const CsTab = withStyles(
    createStyles({
        root: {
            color: colors.tabForeground,
            background: colors.tabBackground,
        },
        selected: {
            color: colors.tabActiveForeground,
            background: colors.tabActiveBackground,
        },
    }),
)(Tab);
export const CsTabs = withStyles(
    createStyles({
        indicator: {
            background: colors.colorSecondary,
        },
    }),
)(Tabs);

export const CsAppBar = withStyles(
    createStyles({
        colorPrimary: {
            background: colors.tabBackground,
        },
    }),
)(AppBar);

const _listStyles = createStyles({
    root: {
        maxWidth: maxWidth,
    },
});

export const listStyles = makeStyles(_listStyles);

export const CsList = withStyles(_listStyles)(List);

export const CsChip = withStyles((_theme) =>
    createStyles({
        root: {
            color: colors.colorOnSecondary,
            'border-color': colors.colorOnSecondary,
            background: colors.colorSecondary,
            '&$outlined': {},
        },
        outlined: {
            color: colors.colorSecondary,
            'border-color': colors.colorSecondary,
            background: colors.colorOnSecondary,
        },
        label: {
            minWidth: '10em',
        },
        icon: {
            color: colors.colorOnSecondary,
        },
    }),
)(Chip);

export const chipContainerStyles = makeStyles((theme) =>
    createStyles({
        root: {
            maxWidth: maxWidth,
            // display: 'flex',
            // justifyContent: 'center',
            // flexWrap: 'wrap',
            '& > *': {
                margin: theme.spacing(0.5),
            },
        },
    }),
);

export function Chips(props: React.PropsWithChildren<Record<string, unknown>>): JSX.Element {
    const useStyles = chipContainerStyles();

    return <div className={useStyles.root}>{props.children}</div>;
}

export const CsFormControl = withStyles(
    createStyles({
        root: {
            width: '100%',
            maxWidth,
        },
    }),
)(FormControl);

export const themeDefault = createTheme({
    palette: {
        // text: colors.textColors,
        background: {
            default: colors.backgroundDefault,
        },
    },
    overrides: {
        MuiListItemText: {
            primary: {
                color: colors.textPrimary,
            },
            secondary: {
                color: colors.textSecondary,
            },
        },
        MuiListItemIcon: {
            root: {
                color: colors.textPrimary,
            },
        },
        MuiFormLabel: {
            root: {
                color: colors.textPrimary,
            },
        },
        MuiSelect: {
            root: {
                color: colors.textPrimary,
            },
            icon: {
                color: colors.textPrimary,
            },
        },
        MuiInput: {
            underline: {
                '&:after': {
                    borderColor: 'green',
                },
                '&:before': {
                    borderColor: 'red',
                },
            },
        },
        MuiCssBaseline: {
            '@global': {
                html: {
                    background: colors.backgroundDefault,
                },
                body: {
                    color: colors.textPrimary,
                },
                '.panel': {
                    display: 'none',
                    margin: '5em 10px 10px 10px',
                },
                '.panel.active': {
                    display: 'block',
                },
            },
        },
    },
});
