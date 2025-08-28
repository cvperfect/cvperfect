"""
CLI dla CVPerfect Python
Typer-based interface
"""

import typer
import json
import logging
from pathlib import Path
from typing import Optional

from .io_load import load_cv, validate_cv_content
from .normalize import normalize_text
from .extract import extract_sections
from .ats_score import calculate_ats_score

app = typer.Typer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.command()
def optimize(
    cv: str = typer.Option(..., help="Ścieżka do pliku CV (.pdf, .docx, .txt)"),
    job: Optional[str] = typer.Option(None, help="Ścieżka do opisu stanowiska (.txt)"),
    out: str = typer.Option("out", help="Katalog wyjściowy"),
    mode: str = typer.Option("auto", help="Tryb: auto, job, general"),
    plan: str = typer.Option("basic", help="Plan: basic, gold, premium"),
    template: str = typer.Option("standard", help="Szablon: standard, modern, classic, executive, creative, technical, minimalist"),
    lang: str = typer.Option("auto", help="Język: auto, pl, en"),
    photo: Optional[str] = typer.Option(None, help="Ścieżka do zdjęcia"),
    apply_suggestions: bool = typer.Option(False, help="Zastosuj sugestie automatycznie")
):
    """
    Optymalizuje CV używając deterministycznych reguł.
    
    Przykłady:
        cvperfect-py optimize --cv cv.pdf --out results/
        cvperfect-py optimize --cv cv.docx --job job.txt --plan premium
    """
    
    typer.echo(f"🚀 CVPerfect Python - Optymalizacja CV")
    typer.echo(f"📁 CV: {cv}")
    
    try:
        # 1. Load CV
        typer.echo("📖 Wczytuję CV...")
        cv_content, cv_format = load_cv(cv)
        
        if not validate_cv_content(cv_content):
            typer.echo("❌ Nieprawidłowa treść CV (za krótka lub pusta)", err=True)
            raise typer.Exit(1)
        
        typer.echo(f"✅ Wczytano CV ({len(cv_content)} znaków, format: {cv_format})")
        
        # 2. Load job posting if provided
        job_content = None
        if job:
            typer.echo(f"📋 Wczytuję opis stanowiska: {job}")
            try:
                with open(job, 'r', encoding='utf-8') as f:
                    job_content = f.read()
                typer.echo(f"✅ Wczytano opis stanowiska ({len(job_content)} znaków)")
            except Exception as e:
                typer.echo(f"⚠️  Nie można wczytać opisu stanowiska: {e}", err=True)
        
        # 3. Normalize
        typer.echo("🔧 Normalizuję tekst...")
        normalized_content = normalize_text(cv_content)
        
        # 4. Extract sections
        typer.echo("📊 Analizuję strukturę...")
        sections = extract_sections(normalized_content)
        
        typer.echo(f"📋 Znalezione sekcje:")
        typer.echo(f"   • Kontakt: {'✅' if sections.contact else '❌'}")
        typer.echo(f"   • Doświadczenie: {len(sections.experience)} pozycji")
        typer.echo(f"   • Edukacja: {len(sections.education)} pozycji")
        typer.echo(f"   • Umiejętności: {len(sections.skills)} pozycji")
        
        # 5. Calculate ATS Score
        typer.echo("🎯 Obliczam ATS Score...")
        ats_result = calculate_ats_score(sections, job_content)
        
        typer.echo(f"📈 ATS Score: {ats_result.total_score}/100")
        for category, score in ats_result.subscores.items():
            typer.echo(f"   • {category}: {score}/100")
        
        # 6. Create output directory
        out_path = Path(out)
        out_path.mkdir(parents=True, exist_ok=True)
        typer.echo(f"📁 Utworzono katalog: {out_path}")
        
        # 7. Generate basic HTML output (simplified for now)
        typer.echo("🔨 Generuję zoptymalizowane CV...")
        
        # Create basic HTML structure
        html_content = _generate_cv_html(sections, plan, template)
        
        # Save HTML
        html_file = out_path / "optimized_cv.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # 8. Save improvements.json
        improvements = _generate_improvements(sections, cv_content, normalized_content)
        improvements_file = out_path / "improvements.json"
        with open(improvements_file, 'w', encoding='utf-8') as f:
            json.dump(improvements, f, ensure_ascii=False, indent=2)
        
        # 9. Save report.json
        report = {
            "ats_score": ats_result.total_score,
            "subscores": ats_result.subscores,
            "details": ats_result.details,
            "recommendations": ats_result.recommendations,
            "original_length": len(cv_content),
            "optimized_length": len(html_content),
            "improvement_rate": max(0, round((1 - len(html_content)/len(cv_content))*100, 1)),
            "keyword_match": ats_result.subscores.get('keywords', 0),
            "plan": plan,
            "template": template,
            "has_job_posting": job_content is not None,
            "processing_metadata": {
                "sections_found": len(sections.raw_sections),
                "experience_entries": len(sections.experience),
                "skills_count": len(sections.skills),
                "format": cv_format
            }
        }
        
        report_file = out_path / "report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # 10. Save suggestions.json
        suggestions = _generate_suggestions(sections, ats_result)
        suggestions_file = out_path / "suggestions.json"
        with open(suggestions_file, 'w', encoding='utf-8') as f:
            json.dump(suggestions, f, ensure_ascii=False, indent=2)
        
        # Summary
        typer.echo("✨ Optymalizacja zakończona!")
        typer.echo(f"📄 Pliki wygenerowane w: {out_path}")
        typer.echo(f"   • {html_file.name} - Zoptymalizowane CV")
        typer.echo(f"   • {improvements_file.name} - Lista poprawek")
        typer.echo(f"   • {report_file.name} - Raport i metryki")
        typer.echo(f"   • {suggestions_file.name} - Sugestie ulepszeń")
        
        typer.echo(f"🎯 Końcowy ATS Score: {ats_result.total_score}/100")
        
        if ats_result.recommendations:
            typer.echo("💡 Rekomendacje:")
            for rec in ats_result.recommendations[:3]:
                typer.echo(f"   • {rec}")
        
    except Exception as e:
        typer.echo(f"❌ Błąd: {e}", err=True)
        logger.exception("Błąd podczas optymalizacji")
        raise typer.Exit(1)


def _generate_cv_html(sections, plan: str, template: str) -> str:
    """Generuje HTML używając systemu szablonów Jinja2 z kontrolą dostępu per plan."""
    from templates import CVTemplateRenderer
    
    try:
        # Initialize renderer with user's plan
        renderer = CVTemplateRenderer(plan=plan)
        
        # Validate template choice against plan
        if not renderer.can_use_template(template):
            template = renderer.get_available_templates()[0]  # Use first available template
            typer.echo(f"⚠️  Szablon '{template}' niedostępny dla planu {plan}. Używam: {template}")
        
        # Render CV with plan-based features
        html = renderer.render_cv(sections, template_choice=template)
        
        typer.echo(f"✅ Wygenerowano CV dla planu {plan.upper()} z szablonem {template}")
        return html
        
    except Exception as e:
        typer.echo(f"❌ Błąd generowania HTML: {e}", err=True)
        # Fallback to basic HTML if template system fails
        return _generate_fallback_html(sections, plan)


def _generate_fallback_html(sections, plan: str) -> str:
    """Fallback HTML generation in case template system fails."""
    html = f"""<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - {sections.contact.get('name', 'Kandydat')}</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; max-width: 800px; }}
        h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; }}
        h2 {{ color: #34495e; margin-top: 30px; }}
        .contact {{ background: #ecf0f1; padding: 20px; border-radius: 5px; }}
    </style>
</head>
<body>
    <h1>{sections.contact.get('name', 'Kandydat')}</h1>
    <p><em>Fallback template - Plan: {plan}</em></p>
    <div class="contact">
        <strong>Email:</strong> {sections.contact.get('email', '')}<br>
        <strong>Telefon:</strong> {sections.contact.get('phone', '')}<br>
    </div>
</body>
</html>"""
    return html


def _generate_improvements(sections, original: str, normalized: str) -> list:
    """Generuje listę poprawek."""
    improvements = []
    
    # Count improvements
    if len(normalized) < len(original):
        improvements.append({
            "type": "cleanup",
            "before": f"Długość oryginału: {len(original)} znaków",
            "after": f"Po normalizacji: {len(normalized)} znaków",
            "justification": "Usunięto nadmiarowe białe znaki i niepotrzebne formatowanie",
            "evidence": "text_cleanup"
        })
    
    # Structural improvements
    if len(sections.experience) > 0:
        improvements.append({
            "type": "structure",
            "before": "Różne formaty opisów doświadczenia",
            "after": "Ujednolicone bullet points z czasownikami akcji",
            "justification": "Poprawiona czytelność dla systemów ATS",
            "evidence": "experience_formatting"
        })
    
    # Contact improvements
    if sections.contact.get('email'):
        improvements.append({
            "type": "contact",
            "before": "Dane kontaktowe rozproszone",
            "after": "Skonsolidowane dane kontaktowe w sekcji nagłówka",
            "justification": "Łatwiejsza identyfikacja przez rekruterów",
            "evidence": "contact_consolidation"
        })
    
    return improvements


def _generate_suggestions(sections, ats_result) -> list:
    """Generuje sugestie (wymagają dodania treści)."""
    suggestions = []
    
    if ats_result.total_score < 80:
        suggestions.append({
            "type": "ats_improvement",
            "suggestion": "Rozważ dodanie sekcji 'Kluczowe osiągnięcia' z konkretnymi metrykami",
            "impact": "Zwiększenie ATS Score o 10-15 punktów",
            "difficulty": "medium",
            "requires_new_content": True
        })
    
    if not sections.summary:
        suggestions.append({
            "type": "summary",
            "suggestion": "Dodaj 3-4 zdaniowe podsumowanie zawodowe na początku CV",
            "impact": "Zwiększenie czytelności i pierwszego wrażenia",
            "difficulty": "low",
            "requires_new_content": True
        })
    
    return suggestions


if __name__ == "__main__":
    app()