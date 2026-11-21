# Phase 1 asset and content checklist

The prototype uses the existing portrait and real Genix captures from the published thesis evidence. The Genix narrative, pseudocode, and scoped outcomes draw on the public [Genix documentation](https://github.com/possiphil/Genix/blob/main/Packages/com.possiphil.genix/Documentation~/concepts/generation-pipeline.md) and [thesis evidence](https://github.com/possiphil/Genix-Thesis-Evidence).

| Input | Needed | Where it goes |
| --- | --- | --- |
| Portrait | Confirm publication approval for the existing image, or supply an original graduation portrait with crop room around the face and shoulders for both orientations. | `media.portrait` |
| Genix gallery loop | A short silent, seamless recording of the actual Unity workflow. A useful sequence would show the starting scene, Preview, and Apply Preview. Include a still frame with enough editor context for the 16:10 mobile card. | `media.genix.cover`, including optional `video` |
| Genix interface captures | Full-resolution Unity editor screenshots that show rule authoring, the Generator preview, or diagnostics. Include what each image demonstrates and what must be redacted. The current frames show the generated layouts from the thesis review. | `media.genix` in the media manifest |
| Genix copy review | Confirm the emphasis on spatial context, bounded search for required placements, preview and apply, and the scoped evaluation outcome. | Genix `study` in `src/content/portfolio.ts` |
| Other work | Confirm the final shortlist and order. For Orchestrator, Application Optimizer, and Crawler, provide an approved cover, a short description, stack, engineering story, real outcomes, and any approved screenshots or public links. | Individual project entries and media |
| Résumé | Final accessible PDF approved for publication. | `public/` and `contact.resume` |
| Contact | A working two-way email address and the public LinkedIn profile URL. If using a custom email domain, confirm incoming and outgoing mail works. | `contact` in the media manifest |
| Copy and skills | Approve or revise the draft hero line, About statement, toolkit groupings, and Contact invitation. The toolkit is drawn from the existing portfolio. | `src/content/portfolio.ts` |

The ending teaser appears once a second complete case study is available. Email, LinkedIn, and résumé affordances are disabled pending confirmed inputs. Native page and theme transitions use the browser’s View Transition support, with ordinary navigation and immediate theme changes as fallbacks.

## Capture provenance

Genix Thesis Evaluation Evidence by Philipp Sanktjohanser (2026), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The originals are in [visual-review-captures-part05.tar.gz](https://github.com/possiphil/Genix-Thesis-Evidence/blob/main/visual-review/captures/visual-review-captures-part05.tar.gz). The archive was checked against the repository’s published SHA-256. The files are lossless WebP encodings of the 1280 × 720 originals. CSS adjusts the cover’s framing and tone for the gallery and showcase.

| Local image | Archive member |
| --- | --- |
| `src/assets/genix/office-overview.webp` | `0461_Office_seed_-815896462/overview.png` |
| `src/assets/genix/office-plan.webp` | `0461_Office_seed_-815896462/top.png` |
| `src/assets/genix/outdoor-layout.webp` | `0481_Outdoor_Environment_seed_-815896462/overview.png` |

Education names were checked against the [University of Augsburg Software Engineering program](https://www.uni-augsburg.de/en/studium/studienangebot/uebersicht/software-engineering-elite-graduate-programme-msc/) and [TUM’s Informatics: Games Engineering listing](https://www.cit.tum.de/en/cit/studies/degree-programs/bachelor-informatics-games-engineering/). Personal milestones use the dates in the approved design spec.
