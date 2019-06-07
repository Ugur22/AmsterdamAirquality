import React from "react";
import { Accordion, AccordionItem } from "react-light-accordion";

class AccordionInfo extends React.Component {
  constructor(props) {
    super();

    this.state = {};
  }

  render() {
    return (
      <Accordion atomic={true}>
        <AccordionItem title="Wat is NO2?">
          <p>
            NO2 ontstaat uit een reactie tussen stikstofmonoxide en ozon. Het
            weer en de verkeersdrukte hebben grote invloed op de concentratie.
            De wettelijke norm is een jaargemiddelde van 40 (μg/m3).
          </p>
        </AccordionItem>

        <AccordionItem title="Wat is de bedoeling van dit platform?">
          <p>
            De bedoeling van dit platform is om erachter te komen of fietser in
            Amsterdam bewuster over hoe luchtkwaliteit je gezondheid beinvloed.
            Verder zijn we ook aan het kijken hoe deze kennis omgezet kan worden
            in gedragsverandeing.
          </p>
        </AccordionItem>

        <AccordionItem title="Hoe werkt het?">
          <p>
            Op de kaart zie je verschillende stations in Amsterdam die
            luchtkwaliteit meten. Deze stations zijn van het RIVM en meten de
            NO2 waardes van dat gebied. Hoe hoger de waardes hoe slechter de
            luchtkwaliteit is. Op basis de informatie die je op de kaart krijgt
            over de luchtkwaliteit kan je een route plannen. Maak gebruik van de
            route planner linksboven of kies een bestemming en vetrekpunt door
            op de kaart te klikken.
          </p>
        </AccordionItem>
      </Accordion>
    );
  }
}

export default AccordionInfo;
