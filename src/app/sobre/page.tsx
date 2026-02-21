import { fetchSubmissions } from "@/app/actions/submissions";
import { SobreClient } from "./SobreClient";

export default async function SobrePage() {
    // Fetch up to 4 items for the 'Impacto e Conquistas' category
    const { items: testimonials } = await fetchSubmissions({
        page: 1,
        limit: 4,
        query: '',
        categories: ['Impacto e Conquistas'],
        sort: 'recentes'
    });

    return (
        <SobreClient initialTestimonials={testimonials} />
    );
}
