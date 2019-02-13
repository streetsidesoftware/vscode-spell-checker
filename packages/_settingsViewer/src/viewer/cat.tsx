import * as React from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import * as spellCheckIcon from './images/SpellCheck.xs.png';

interface CatInfo {
  title: string;
  image: string;
  icon: string;
}

export function CatPanel(cat: CatInfo) {
  return (
    <Grid>
        <Row>
            <Cell columns={12}>
                <img src={spellCheckIcon}/>
                <i className="material-icons">{cat.icon}</i>
                {cat.title} !
            </Cell>
            <Cell columns={12}>
                <img
                    src={cat.image}
                    alt={cat.title}
                    width="300"
                />
            </Cell>
        </Row>
    </Grid>
  );
}

export class CatPanel2 extends React.Component<{cat: CatInfo}, {}> {
    render() {
        const cat = this.props.cat;
        return (
          <Grid>
              <Row>
                  <Cell columns={12}>
                      <i className="material-icons">{cat.icon}</i>
                      {cat.title}
                  </Cell>
                  <Cell columns={12}>
                      <img
                          src={cat.image}
                          alt={cat.title}
                          width="300"
                      />
                  </Cell>
              </Row>
          </Grid>
        );
     }
}
