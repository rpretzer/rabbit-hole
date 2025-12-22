#!/usr/bin/env python3
"""
Generate comprehensive metadata for artwork series based on image analysis.
"""

import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
ARTWORK_DIR = BASE_DIR / "images" / "artwork"
CONTENT_DIR = BASE_DIR / "content" / "artwork"

def get_image_list(series_id):
    """Get sorted list of images for a series."""
    series_dir = ARTWORK_DIR / series_id
    if not series_dir.exists():
        return []
    
    images = sorted(series_dir.glob("*.png"))
    return [f"images/artwork/{series_id}/{img.name}" for img in images]

def generate_alchemical_study_metadata():
    """Generate metadata for Alchemical Study series."""
    images = get_image_list("alchemical-study")
    
    return {
        "id": "alchemical-study",
        "title": "Alchemical Study",
        "date": "2022-2024",
        "series": "Alchemical Study",
        "description": "A contemplative series exploring medieval woodblock print aesthetics, featuring symbolic representations of transformation, observation, and ritual. The all-seeing eye and priestly figures holding eggs create a visual language of witnessing, incubation, and alchemical processes. Each composition references historical printmaking techniques while engaging with themes of surveillance, faith, and the transmutation of materials and ideas.",
        "thumbnail": "images/artwork/alchemical-study/thumbnail.jpg",
        "images": [
            {
                "src": img_path,
                "alt": f"Medieval woodblock print style composition {i+1} - alchemical study with all-seeing eye and priest figure",
                "caption": f"Alchemical Study #{i+1}"
            }
            for i, img_path in enumerate(images)
        ],
        "tags": ["medieval", "woodblock", "alchemy", "symbolism", "ritual", "transformation", "printmaking", "witnessing"],
        "published": True
    }

def generate_cubist_compositions_metadata():
    """Generate metadata for Cubist Compositions series."""
    images = get_image_list("cubist-compositions")
    
    return {
        "id": "cubist-compositions",
        "title": "Cubist Compositions",
        "date": "2022-2024",
        "series": "Cubist Compositions",
        "description": "Fragmented explorations of everyday moments—a man in a cafe, eating, drinking coffee—reconstructed through geometric abstraction. These compositions draw from early 20th century Cubism's deconstruction of perspective, breaking the singular viewpoint into multiple simultaneous planes. The works engage with the flattening and reconstruction of observed reality, creating a visual rhythm that suggests the movement and multiplicity inherent in a simple moment. Cleveland serves as both setting and departure point for these abstracted recollections.",
        "thumbnail": "images/artwork/cubist-compositions/thumbnail.jpg",
        "images": [
            {
                "src": img_path,
                "alt": f"Cubist composition {i+1} - fragmented cafe scene with geometric forms",
                "caption": f"Cubist Composition #{i+1}"
            }
            for i, img_path in enumerate(images)
        ],
        "tags": ["cubism", "abstract", "geometric", "modernism", "fragmentation", "cafe", "cleveland", "perspective"],
        "published": True
    }

def generate_portrait_series_metadata():
    """Generate metadata for Portrait Series."""
    images = get_image_list("portrait-series")
    
    return {
        "id": "portrait-series",
        "title": "Portrait Series",
        "date": "2022-2024",
        "series": "Portrait Series",
        "description": "A series of stylized portraits examining elongation, ritual objects, and the act of holding. The figures—tall, slender, with extended necks—are shown in profile, creating a visual language that references both African sculptural traditions and modernist simplification. The recurring motif of the egg functions as symbol and object: held in hand, held in mouth, presented as offering or burden. Some compositions situate the figure against Cape Cod architecture, creating tension between the abstracted form and specific place. These are studies in observation, transformation, and the weight of symbolic objects in relation to the body.",
        "thumbnail": "images/artwork/portrait-series/thumbnail.jpg",
        "images": [
            {
                "src": img_path,
                "alt": f"Stylized portrait {i+1} - elongated figure in profile with symbolic objects",
                "caption": f"Portrait #{i+1}"
            }
            for i, img_path in enumerate(images)
        ],
        "tags": ["portrait", "stylized", "elongation", "profile", "ritual", "egg", "symbolism", "african-influence", "modernism", "cape-cod"],
        "published": True
    }

def generate_visitation_series_metadata():
    """Generate metadata for Visitation Series."""
    images = get_image_list("visitation-series")
    
    return {
        "id": "visitation-series",
        "title": "Visitation Series",
        "date": "2022-2024",
        "series": "Visitation Series",
        "description": "Nocturnal studies of intrusion and presence. A slender, abnormally tall figure with spindly limbs occupies the corner of a bedroom—an observer, a witness, a presence that exists in the liminal space between sleep and wakefulness. These works explore the architecture of fear and the geometry of domestic spaces under the weight of the unseen. The corner itself becomes both refuge and trap, the figure both threat and guardian. The series engages with folklore, urban legend, and the persistence of figures that watch in darkness, examining how physical space becomes psychological territory when occupied by the unfamiliar form.",
        "thumbnail": "images/artwork/visitation-series/thumbnail.jpg",
        "images": [
            {
                "src": img_path,
                "alt": f"Visitation scene {i+1} - slender tall figure in bedroom corner at night",
                "caption": f"Visitation #{i+1}"
            }
            for i, img_path in enumerate(images)
        ],
        "tags": ["nocturnal", "visitation", "presence", "liminal", "domestic", "folklore", "witnessing", "darkness", "intrusion"],
        "published": True
    }

def generate_watchers_series_metadata():
    """Generate metadata for Watchers Series."""
    images = get_image_list("watchers-series")
    
    return {
        "id": "watchers-series",
        "title": "Watchers Series",
        "date": "2022-2024",
        "series": "Watchers Series",
        "description": "Urban nocturnes under the gaze of the all-seeing eye. These compositions merge Art Deco architecture with the persistent motif of surveillance—the eye that watches over nighttime cityscapes populated by diverse figures. The works examine the relationship between architectural grandeur and the mechanisms of observation, between the public spectacle of the city and the private act of watching. The Art Deco style, with its geometric precision and vertical aspirations, becomes both monument and cage, while the all-seeing eye functions as both protector and invader. These are meditations on visibility, on who watches and who is watched, on the city as both stage and panopticon.",
        "thumbnail": "images/artwork/watchers-series/thumbnail.jpg",
        "images": [
            {
                "src": img_path,
                "alt": f"Watchers scene {i+1} - all-seeing eye over nighttime art deco cityscape",
                "caption": f"Watchers #{i+1}"
            }
            for i, img_path in enumerate(images)
        ],
        "tags": ["surveillance", "urban", "nocturnal", "art-deco", "all-seeing-eye", "cityscape", "architecture", "watching", "panopticon", "visibility"],
        "published": True
    }

def generate_table_series_metadata():
    """Generate metadata for Table Series."""
    images = get_image_list("table-series")
    
    return {
        "id": "table-series",
        "title": "Table Series",
        "date": "2022-2024",
        "series": "Table Series",
        "description": "Table interactions as sites of ritual, power, and distortion. Two figures at shared tables—dining, conversing, confronting—with distorted features that transform domestic spaces into unsettling theaters. Elongated limbs, red eyes, pale skin, and exaggerated expressions mark these scenes of consumption and communion. The table functions as both stage and barrier, the shared meal both ritual and confrontation. Red appears as accent and warning, marking moments of intensity, consumption, and unease. These works examine how the most ordinary of domestic rituals—eating together—becomes charged with the grotesque, the theatrical, and the uncanny.",
        "thumbnail": "images/artwork/table-series/thumbnail.jpg",
        "images": [
            {
                "src": img_path,
                "alt": f"Table scene {i+1} - two figures at table with distorted features",
                "caption": f"Table #{i+1}"
            }
            for i, img_path in enumerate(images)
        ],
        "tags": ["table", "dining", "interaction", "distortion", "gothic", "domestic", "ritual", "red", "grotesque", "theatrical", "uncanny"],
        "published": True
    }

def main():
    """Generate and save metadata for all series."""
    metadata = {
        "alchemical-study": generate_alchemical_study_metadata(),
        "cubist-compositions": generate_cubist_compositions_metadata(),
        "portrait-series": generate_portrait_series_metadata(),
        "visitation-series": generate_visitation_series_metadata(),
        "watchers-series": generate_watchers_series_metadata(),
        "table-series": generate_table_series_metadata()
    }
    
    for series_id, data in metadata.items():
        output_path = CONTENT_DIR / f"{series_id}.json"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Generated metadata for {series_id}: {len(data['images'])} images")

if __name__ == "__main__":
    main()

