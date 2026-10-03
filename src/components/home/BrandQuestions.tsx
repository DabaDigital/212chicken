import { PillLink } from "@/components/ui/PillLink";
import { restaurants } from "@/lib/restaurants";
import styles from "./BrandQuestions.module.css";

export function BrandQuestions() {
  const cities = [...new Set(restaurants.map(({ city }) => city))];
  return (
    <section className={styles.section} aria-labelledby="brand-questions-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>212 Chicken au Maroc</p>
          <h2 id="brand-questions-title" className={styles.title}>Le poulet croustillant,<br /><span className="accent">près de chez vous.</span></h2>
          <p>212 Chicken propose des burgers au poulet croustillant, des tenders, des wraps et des box à partager, ainsi que des milkshakes et des desserts.</p>
          <PillLink href="/restaurants" variant="outline">Trouver mon restaurant</PillLink>
        </div>
        <div className={styles.questions}>
          <details open>
            <summary>Où trouver 212 Chicken au Maroc ?</summary>
            <p>Retrouvez {restaurants.length} restaurants dans notre annuaire, à {cities.join(", ")}. Chaque adresse dispose d’une fiche pour préparer votre visite et consulter l’itinéraire.</p>
          </details>
          <details>
            <summary>Où consulter le menu et les prix de 212 Chicken ?</summary>
            <p>La page « La carte » présente les produits et leurs prix en dirhams marocains (DH) : burgers, tenders, box, wraps, salades, milkshakes et desserts.</p>
            <PillLink href="/carte" variant="outline">Consulter le menu et les prix</PillLink>
          </details>
          <details>
            <summary>Quels sont les horaires des restaurants ?</summary>
            <p>Les horaires disponibles sont affichés sur chaque fiche restaurant. Ils peuvent varier selon l’adresse et le jour : consultez le lien Google Maps du restaurant avant votre visite.</p>
          </details>
          <details>
            <summary>Peut-on manger sur place, emporter ou se faire livrer ?</summary>
            <p>Les services dépendent du restaurant. Les fiches Maarif et Aeria Mall indiquent sur place, à emporter et livraison. Consultez la fiche de votre adresse pour connaître les services indiqués et les informations sur Google Maps.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
