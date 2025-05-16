import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import gsap from 'gsap';
import Observer from 'gsap/Observer';

gsap.registerPlugin(Observer);

@Component({
  selector: 'app-observer-carousel',
  standalone: false,
  templateUrl: './observer-carousel.component.html',
  styleUrl: './observer-carousel.component.css',
})
export class ObserverCarouselComponent implements AfterViewInit {
  @ViewChild('carousel') carouselRef!: ElementRef;
  @ViewChild('leftArrow', { static: true }) leftArrow!: ElementRef;

  animateArrowIn() {
    gsap.to(this.leftArrow.nativeElement, {
      x: -5,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  animateArrowOut() {
    gsap.to(this.leftArrow.nativeElement, {
      x: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  }


  private currentRotation = 0;
  private readonly numFaces = 6;

  ngAfterViewInit(): void {
    const carouselElement = this.carouselRef.nativeElement as HTMLElement;
    const angle = 360 / this.numFaces;

    // Set each face’s position in 3D space
    Array.from(carouselElement.children).forEach((face: Element, i: number) => {
      const rotation = angle * i;
      gsap.set(face, {
        transform: `rotateY(${rotation}deg) translateZ(400px)`,
      });
    });

    // Highlight the front-facing image
    const faces = Array.from(carouselElement.children) as HTMLElement[];
    faces.forEach((face) => face.classList.remove('front'));

    let frontIndex =
      Math.round((this.currentRotation % 360) / (360 / this.numFaces)) %
      this.numFaces;
    if (frontIndex < 0) frontIndex += this.numFaces;
    faces[frontIndex].classList.add('front');

    // Correctly extract deltaX from Observer instance
    // Observer.create({
    //   type: 'touch,pointer,wheel',
    //   target: carouselElement,
    //   onChange: (self) => {
    //     const dx = self.deltaX;
    //     this.currentRotation += dx * -0.3;

    //     gsap.to(carouselElement, {
    //       rotateY: this.currentRotation,
    //       // rotateX: -5,
    //       duration: 1,
    //       ease: 'power2.out',
    //     });
    //   },
    // });
    Observer.create({
      type: 'touch,pointer,wheel',
      target: carouselElement,
      onChangeX: (self) => {
        const dx = self.deltaX;
        this.currentRotation += dx * -0.3;

        gsap.to(carouselElement, {
          rotateY: this.currentRotation,
          duration: 1,
          ease: 'power2.out',
          onUpdate: () => this.highlightFrontFace(carouselElement),
        });
      },
    });
  }

  private highlightFrontFace(carousel: HTMLElement): void {
  const faces = Array.from(carousel.children) as HTMLElement[];
  const anglePerFace = 360 / this.numFaces;

  // Fix: normalize rotation to match face angles
  const frontIndex = (Math.round(-this.currentRotation / anglePerFace) % this.numFaces + this.numFaces) % this.numFaces;

  faces.forEach((face, i) => {
    face.classList.toggle('front', i === frontIndex);
  });
}


  private zoomedElements = new Set<HTMLElement>();

  toggleZoom(event: Event): void {
    const element = event.currentTarget as HTMLElement;

    if (this.zoomedElements.has(element)) {
      // Revert to original state
      gsap.to(element, {
        scale: 1,
        // rotateX: 0,
        // rotateY: 0,
        // zIndex: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
      this.zoomedElements.delete(element);
    } else {
      // Zoom in and bring to front
      gsap.to(element, {
        scale: 2,
        // rotateX: 0,
        // rotateY: 0,
        // zIndex: 1000,
        duration: 0.6,
        ease: 'power2.out',
      });
      this.zoomedElements.add(element);
    }
  }
}
