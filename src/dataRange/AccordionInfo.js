import React from "react";
import TrafficRange from "../dataRange/TrafficRange";
import AirQualityRange from "../dataRange/AirQualityRange";
import { Accordion, AccordionItem } from "react-sanfona";

class AccordionInfo extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    return (
      <div className="accordion">
        <Accordion>
          <AccordionItem className="itemUp info" title={"Wat moet ik weten?"} expandedClassName={"itemDown"} titleTag={"h5"}>
            <Accordion>
              <AccordionItem title={"Wat is NO2?"} titleTag={"h5"}>
                <p>
                  NO2 ontstaat uit een reactie tussen stikstofmonoxide en ozon. Het weer en de verkeersdrukte hebben grote invloed op de concentratie. De wettelijke norm is een jaargemiddelde van 40
                  (μg/m3).
                </p>
              </AccordionItem>
              <AccordionItem title={"Wat is de bedoeling van dit platform?"} titleTag={"h5"}>
                <p>
                  De bedoeling van dit platform is om erachter te komen of fietser in Amsterdam bewuster over hoe luchtkwaliteit je gezondheid beinvloed. Verder zijn we ook aan het kijken hoe deze
                  kennis omgezet kan worden in gedragsverandeing.
                </p>
              </AccordionItem>
              <AccordionItem title={"Hoe werkt het?"} titleTag={"h5"}>
                <p>
                  Op de kaart zie je verschillende stations in Amsterdam die luchtkwaliteit meten. Deze stations zijn van het RIVM en meten de NO2 waardes van dat gebied. Hoe hoger de waardes hoe
                  slechter de luchtkwaliteit is. Op basis van de informatie die je op de kaart krijgt over de luchtkwaliteit kan je een route plannen. Maak gebruik van de route planner linksboven of kies
                  een bestemming en vetrekpunt door op de kaart te klikken.
                </p>
              </AccordionItem>
            </Accordion>
          </AccordionItem>
        </Accordion>
        <Accordion>
          <AccordionItem title={"Legenda"} expanded={true} titleTag={"h5"} expandedClassName={"itemDown"} className="itemUp info">
            <AirQualityRange />
            <TrafficRange />
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
}

export default AccordionInfo;
