


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library both legal-document components and LegalModal are built on. How: This is used directly (React.Fragment, React.useRef, React.useState, React.useEffect) throughout, instead of importing individual named hooks.


import { Icon         } from './ui.jsx'; // What: Icon. Why: The modal's own close button needs a recognizable glyph. How: This is rendered inside LegalModal's close button with the name 'x'.
import { reduceMotion } from './ui.jsx'; // What: Reduce Motion. Why: A user who prefers reduced motion should dismiss the modal instantly instead of playing its own closing animation. How: This is checked inside LegalModal's modDisFun to skip the animated delay.

// #endregion Imports



/**
 * legal-docs.jsx = Legal Documents
 *
 * @summary
 * Legal documents shown in a Settings-initiated modal (Privacy Policy /
 * Terms of Service). Each document is a self-contained component owning
 * its own body copy, so when the real legal text lands it is a one-file
 * edit per document. LegalModal is the shared shell: backdrop plus
 * centered scrollable panel, dismissible via Esc, a backdrop click, or
 * the close button, with focus moved into the panel on open and an
 * animated close (skipped for a user who prefers reduced motion). The
 * body copy below is placeholder text pending the real, final
 * documents.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region PriPolCom

/**
 * PriPolCom = Privacy Policy Component
 *
 * @summary
 * Renders the Privacy Policy's own body copy (a title, a run of
 * sections, subsections, paragraphs and lists) as a React.Fragment, so
 * LegalModal can drop it straight into its own scrollable body div
 * alongside TerSerCom. The copy itself is placeholder text pending the
 * real, final Privacy Policy.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The policy's own document markup, wrapped in a Fragment.
 *
 * @example
 * ```tsx
 * PriPolCom({}) // => <PriPolCom />
 * ```
 *
*/

function PriPolCom () {



	return (


		<React.Fragment>{ /* What: Container Fragment Element. Why: The document's own top-level elements need one wrapper so LegalModal can render them as a single child, without adding an extra DOM node of its own. How: This wraps the policy's own heading, sections, and lists below. */ }


			<h1>Privacy Policy</h1>{ /* What: Document Title Heading Element. Why: This is the document's own top-level heading naming which legal document this is. How: This renders as a plain h1 at the top of the document body. */ }

			<p>Last updated: July 26, 2026</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent (where consent is required). This Privacy Policy has been created with the help of the <a
				href='https://www.termsfeed.com/privacy-policy-generator/'
				target='_blank'
			>Privacy Policy Generator</a>{ /* What: Inline Generator Credit Link Element. Why: This credits the third-party generator this placeholder legal text was created with. How: This opens the linked generator page in a new tab. */ }.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Interpretation and Definitions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<h3>Interpretation</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h3>Definitions</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>For the purposes of this Privacy Policy:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Account</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means a unique account created for You to access Our Service or parts of Our Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Affiliate</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Company</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Privacy Policy) refers to Ease My Life.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Cookies</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website, among its many uses.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Country/State</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to: Missouri, United States.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Device</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any device that can access the Service, such as a computer, a cell phone or a digital tablet.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Personal Data</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (or &quot;Personal Information&quot;) is any information that relates to an identified or identifiable individual.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }

					<p>We use &quot;Personal Data&quot; and &quot;Personal Information&quot; interchangeably unless a law uses a specific term.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to the Website.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Service Provider</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Usage Data</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>User</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any individual who accesses or uses the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Website</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to Ease My Life, accessible from <a
						href='https://www.easemylife.app'
						target='_blank'
						rel='external nofollow noopener'
					>https://www.easemylife.app</a>{ /* What: Inline Site Link Element. Why: This points the reader at the app's own live website. How: This opens the site in a new tab. */ }.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>

			<h2>Collecting and Using Your Personal Information</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<h3>Types of Data Collected</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<h4>Personal Data</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the surrounding legal-modal-body CSS. */ }

			<p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>Email address</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>

			<h4>Usage Data</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the surrounding legal-modal-body CSS. */ }

			<p>Usage Data is collected automatically when using the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of Our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h4>Tracking Technologies and Cookies</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the surrounding legal-modal-body CSS. */ }

			<p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies We use include beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li><strong>Cookies or Browser Cookies.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of Our Service.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li><strong>Web Beacons.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } Certain sections of Our Service and Our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>

			<p>Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Where required by law, We use non-essential cookies (such as analytics, advertising, and remarketing cookies) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>We use both Session and Persistent Cookies for the purposes set out below:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Necessary / Essential Cookies</strong>{ /* What: Standalone Label Strong Element. Why: This bolds a short category name with nothing else in its own paragraph. How: This wraps the label text in a native strong tag for visual emphasis, with no continuing text after it. */ }</p>{ /* What: Bold Standalone Label Paragraph Element. Why: This bolds a short category name with nothing else on its own line, ahead of the labeled facts below it. How: This wraps the label text in a native strong tag for visual emphasis. */ }

					<p>Type: Session Cookies</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<p>Administered by: Us</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Cookies Policy / Notice Acceptance Cookies</strong>{ /* What: Standalone Label Strong Element. Why: This bolds a short category name with nothing else in its own paragraph. How: This wraps the label text in a native strong tag for visual emphasis, with no continuing text after it. */ }</p>{ /* What: Bold Standalone Label Paragraph Element. Why: This bolds a short category name with nothing else on its own line, ahead of the labeled facts below it. How: This wraps the label text in a native strong tag for visual emphasis. */ }

					<p>Type: Persistent Cookies</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<p>Administered by: Us</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<p>Purpose: These Cookies identify whether users have accepted the use of cookies on the Website.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Functionality Cookies</strong>{ /* What: Standalone Label Strong Element. Why: This bolds a short category name with nothing else in its own paragraph. How: This wraps the label text in a native strong tag for visual emphasis, with no continuing text after it. */ }</p>{ /* What: Bold Standalone Label Paragraph Element. Why: This bolds a short category name with nothing else on its own line, ahead of the labeled facts below it. How: This wraps the label text in a native strong tag for visual emphasis. */ }

					<p>Type: Persistent Cookies</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<p>Administered by: Us</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<p>Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your Account login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter Your preferences every time You use the Website.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }


				</li>


			</ul>

			<p>For more information about the cookies We use and Your choices regarding cookies, please visit Our Cookies Policy or the Cookies section of Our Privacy Policy.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h3>Use of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>The Company may use Personal Data for the following purposes:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>To provide and maintain Our Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ }, including to monitor the usage of Our Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>To manage Your Account:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>For the performance of a contract:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>To contact You:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>To provide You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } with news, special offers, and general information about other goods, services and events which We offer that are similar to those that You have already purchased or inquired about. We send such marketing communications only where permitted by applicable law: where prior consent is required (for example, under the laws applicable in the EEA and the UK), We will send them only with Your consent; otherwise, We may send them until You opt out. You may opt out or withdraw Your consent at any time by using the unsubscribe link in any marketing email We send or by contacting Us.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>To manage Your requests:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } To attend and manage Your requests to Us.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>For business transfers:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about Our Service users is among the assets transferred.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>For other purposes</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ }: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of Our promotional campaigns, and evaluating and improving Our Service, products, services, marketing and Your experience.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>

			<p>We may share Your Personal Data in the following situations:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li><strong>With Service Providers:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share Your Personal Data with Service Providers to monitor and analyze the use of Our Service, and to contact You.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li><strong>For business transfers:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li><strong>With Affiliates:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share Your Personal Data with Our affiliates, in which case We will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li><strong>With business partners:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share Your Personal Data with Our business partners to offer You certain products, services or promotions. Business partners may use this information for their own purposes, as described in their own privacy policies.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li><strong>With other users:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside the Service.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li><strong>With Your consent</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ }: We may disclose Your Personal Data for any other purpose with Your consent.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>

			<h3>Retention of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with Our legal obligations (for example, if We are required to retain Your data to comply with applicable laws), resolve disputes, and enforce Our legal agreements and policies.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods below are maximum periods (&quot;up to&quot;) and We may delete or anonymize data sooner when it is no longer needed for the relevant purpose. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p>Account Information</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


						<li>User Accounts: retained for the duration of Your Account relationship plus up to 24 months after account closure to handle any post-termination issues or resolve disputes.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					</ul>


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p>Customer Support Data</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


						<li>Support tickets and correspondence: up to 24 months from the date of ticket closure to resolve follow-up inquiries, track service quality, and defend against potential legal claims.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

						<li>Chat transcripts: up to 24 months for quality assurance and staff training purposes.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					</ul>


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p>Usage Data</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

					<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


						<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


							<p>Website analytics data (cookies, IP addresses, device identifiers): up to 24 months from the date of collection, which allows us to analyze trends while respecting privacy principles.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }


						</li>

						<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


							<p>Server logs (IP addresses, access times): up to 24 months for security monitoring and troubleshooting purposes.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }


						</li>


					</ul>


				</li>


			</ul>

			<p>Usage Data is retained in accordance with the retention periods described above, and may be retained longer only where necessary for security, fraud prevention, or legal compliance.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>We may retain Personal Data beyond the periods stated above for different reasons:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>Legal obligation: We are required by law to retain specific data (e.g., financial records for tax authorities).</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Legal claims: Data is necessary to establish, exercise, or defend legal claims.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Your explicit request: You ask Us to retain specific information.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Technical limitations: Data exists in backup systems that are scheduled for routine deletion.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>

			<p>You may request information about how long We will retain Your Personal Data by contacting Us.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>When retention periods expire, We securely delete or anonymize Personal Data according to the following procedures:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>Deletion: Personal Data is removed from Our systems and no longer actively processed.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Backup retention: Residual copies may remain in encrypted backups for a limited period consistent with Our backup retention schedule and are not restored except where necessary for security, disaster recovery, or legal compliance.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Anonymization: In some cases, We convert Personal Data into anonymous statistical data that cannot be linked back to You. This anonymized data may be retained indefinitely for research and analytics.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>

			<h3>Transfer of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. This means that this information may be transferred to and maintained on computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of Your jurisdiction.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and, where relevant, supplementary measures. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of Your data and other personal information.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h3>Delete Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Our Service may give You the ability to delete certain information about You from within the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>You may update, amend, or delete Your information at any time by signing in to Your Account, if You have one, and visiting the account settings section that allows You to manage Your personal information. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h3>Disclosure of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<h4>Business Transactions</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the surrounding legal-modal-body CSS. */ }

			<p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h4>Law Enforcement</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the surrounding legal-modal-body CSS. */ }

			<p>Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h4>Other Legal Requirements</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the surrounding legal-modal-body CSS. */ }

			<p>The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>Comply with a legal obligation</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Protect and defend the rights or property of the Company</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Prevent or investigate possible wrongdoing in connection with the Service</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Protect the personal safety of Users of the Service or the public</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }

				<li>Protect against legal liability</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>

			<h3>Security of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Children's and Minors' Privacy</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>The Service is not directed to, and We do not knowingly collect Personal Information from, anyone under the age of 16.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us. If We become aware that We have collected Personal Information from anyone under the age of 16, We will take steps to remove that information from Our servers as soon as reasonably possible.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Some countries and states set a higher age at which an individual can consent to the processing of their own Personal Information. Where We rely on consent as a legal basis and the law applicable to a User sets an age higher than 16, We may require the consent of that User's parent or guardian before We collect and use their Personal Information.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Links to Other Websites</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Changes to this Privacy Policy</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Contact Us</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>If You have any questions about this Privacy Policy, You can contact Us:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>By email: support@easemylife.app</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>


		</React.Fragment>


	);


}

// #endregion PriPolCom



// #region TerSerCom

/**
 * TerSerCom = Terms Service Component
 *
 * @summary
 * Renders the Terms of Service's own body copy (a title, a run of
 * sections, subsections, paragraphs and lists) as a React.Fragment, so
 * LegalModal can drop it straight into its own scrollable body div
 * alongside PriPolCom. The copy itself is placeholder text pending the
 * real, final Terms of Service.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The terms' own document markup, wrapped in a Fragment.
 *
 * @example
 * ```tsx
 * TerSerCom({}) // => <TerSerCom />
 * ```
 *
*/

function TerSerCom () {



	return (


		<React.Fragment>{ /* What: Container Fragment Element. Why: The document's own top-level elements need one wrapper so LegalModal can render them as a single child, without adding an extra DOM node of its own. How: This wraps the terms' own heading, sections, and lists below. */ }


			<h1>Terms and Conditions</h1>{ /* What: Document Title Heading Element. Why: This is the document's own top-level heading naming which legal document this is. How: This renders as a plain h1 at the top of the document body. */ }

			<p>Last updated: July 26, 2026</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Please read these terms and conditions carefully before using Our Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Interpretation and Definitions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<h3>Interpretation</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h3>Definitions</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>For the purposes of these Terms and Conditions:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Affiliate</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Country/State</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to: Missouri,  United States</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Company</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in these Terms and Conditions) refers to Ease My Life.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Device</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any device that can access the Service such as a computer, a cell phone or a digital tablet.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to the Website.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Terms and Conditions</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (also referred to as &quot;Terms&quot;) means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service. These Terms and Conditions have been created with the help of the <a
						href='https://www.termsfeed.com/terms-conditions-generator/'
						target='_blank'
					>TermsFeed Terms and Conditions Generator</a>{ /* What: Inline Generator Credit Link Element. Why: This credits the third-party generator this placeholder legal text was created with. How: This opens the linked generator page in a new tab. */ }.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Third-Party Social Media Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>Website</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to Ease My Life, accessible from <a
						href='https://www.easemylife.app'
						target='_blank'
						rel='external nofollow noopener'
					>https://www.easemylife.app</a>{ /* What: Inline Site Link Element. Why: This points the reader at the app's own live website. How: This opens the site in a new tab. */ }</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>

				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


					<p><strong>You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>

			<h2>Acknowledgment</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Links to Other Websites</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h3>Links from a Third-Party Social Media Service</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service's terms and privacy policies.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Termination</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Upon termination, Your right to use the Service will cease immediately.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Limitation of Liability</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Governing Law</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>The laws of the Country/State, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Disputes Resolution</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>For European Union (EU) Users</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>United States Legal Compliance</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a &quot;terrorist supporting&quot; country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Severability and Waiver</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<h3>Severability</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h3>Waiver</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the surrounding legal-modal-body CSS. */ }

			<p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Translation Interpretation</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Changes to These Terms and Conditions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<h2>Contact Us</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the surrounding legal-modal-body CSS. */ }

			<p>If you have any questions about these Terms and Conditions, You can contact us:</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text pending the real, final legal document. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the surrounding legal-modal-body CSS. */ }


				<li>By email: support@easemylife.app</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the surrounding legal-modal-body CSS. */ }


			</ul>


		</React.Fragment>


	);


}

// #endregion TerSerCom



// #region LegalModal

/**
 * LegalModal = Legal Modal
 *
 * @summary
 * The shared shell shown for both legal documents (Privacy Policy and
 * Terms of Service): a backdrop plus a centered, scrollable panel,
 * dismissible via Esc, a backdrop click, or the close button, with
 * focus moved into the panel on open and an animated close (skipped
 * outright for a user who prefers reduced motion). Background scroll
 * is locked to whatever offset the app's own <main> scroller was
 * showing at open time and restored to that exact offset on close.
 * Renders nothing at all while which is null.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.which   - Which document to show, 'privacy' or
 *                        'terms', or null to render nothing.
 * @param props.onClose - Called once the close animation (or the
 *                        instant reduced-motion path) finishes.
 *
 * @returns The modal's own backdrop-and-panel markup, or null while
 * which is null.
 *
 * @example
 * ```tsx
 * LegalModal({ which: legalDoc, onClose: () => setLegalDoc(null) }) // => <LegalModal />
 * ```
 *
*/

function LegalModal ( { which, onClose } ) {


	const panEleRef                   = React.useRef( null );   // What: Panel Element Reference. Why: This gives the effect below a handle on the panel so it can be focused on open. How: This is attached via the panel div's ref prop and read inside the open/close effect.
	const [ modCloBoo, setModCloBoo ] = React.useState( false ); // What: Modal Closing Boolean And Setter. Why: This flags the closing-animation window so the backdrop/panel can swap to their own "is-closing" class. How: This is set true by modDisFun and read in both className expressions below.


	const modDisFun = () => { // What: Modal Dismiss Function. Why: Every dismissal path (Esc, backdrop click, close button) needs the same reduced-motion check and the same delayed onClose. How: This calls onClose immediately when reduced motion is preferred, otherwise plays the closing animation for 200ms first.


		if ( reduceMotion && reduceMotion() ) { onClose(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should not see the closing animation at all. How: This calls onClose immediately and skips the animated path below.



		setModCloBoo( true ); // What: Closing State Start Call. Why: This flips both the backdrop and panel into their own "is-closing" class. How: This is read by the className expressions on the backdrop and panel divs below.

		setTimeout( () => { // What: Delayed Close Call. Why: onClose must not fire until the closing animation has actually finished playing. How: This waits 200ms, matching the CSS transition duration, before resetting modCloBoo and calling onClose.


			setModCloBoo( false ); // What: Closing State Clear Call. Why: The next open should not inherit this close's own "is-closing" class. How: This resets modCloBoo back to its default false value.

			onClose(); // What: Deferred Close Call. Why: The caller needs to actually clear which once the closing animation has finished playing. How: This calls the onClose prop passed in from LegalModal's own caller.


		}, 200 );


	};


	React.useEffect( () => { // What: Open State Effect. Why: Every time which changes to a real value, the modal needs its own Esc listener, its own scroll lock, and its own initial focus, all torn back down on close. How: This subscribes a keydown listener, freezes the app's own main scroller, focuses the panel, and returns a cleanup that reverses all three.


		if ( !which ) return; // What: No Document Guard. Why: There is nothing to set up while no document is being shown. How: This bails out of the effect entirely when which is null.



		setModCloBoo( false ); // What: Closing Reset Call. Why: A fresh open should never start mid-closing-animation. How: This clears any stale true value left over from a previous close.


		const onKeyEscFun = ( keyEveObj ) => { if ( keyEveObj.key === 'Escape' ) modDisFun(); }; // What: On Key Escape Function. Why: Esc must dismiss the modal from anywhere on the page while it is open. How: This calls modDisFun only when the pressed key is Escape.


		document.addEventListener( 'keydown', onKeyEscFun ); // What: Escape Key Subscribe Call. Why: onKeyEscFun needs to be live for as long as the modal is open, not just checked once. How: This registers onKeyEscFun to run on every keydown while this effect is active.



		const maiScrEle = document.querySelector( '.main' );         // What: Main Scroll Element. Why: The app scrolls inside this element, not the document body, so this is what actually needs locking. How: This is queried once and reused for both the lock below and the cleanup's own restore.
		const scrTopNum = maiScrEle ? maiScrEle.scrollTop : 0;       // What: Scroll Top Number. Why: The scroller's exact offset at open time must be restored on close, even past the panel's own top/bottom. How: This is read once here and reused in the cleanup's own restore below.
		const preOveStr = maiScrEle ? maiScrEle.style.overflow : ''; // What: Previous Overflow String. Why: The scroller's own prior inline overflow value must be restored exactly, not just cleared. How: This is read once here and reused in the cleanup's own restore below.


		if ( maiScrEle ) maiScrEle.style.overflow = 'hidden'; // What: Scroll Lock Guard. Why: Nothing behind the modal should scroll while it is open. How: This sets the scroller's own inline overflow to hidden, only when the scroller actually exists.



		const focDelTmo = setTimeout( () => { if ( panEleRef.current ) panEleRef.current.focus(); }, 20 ); // What: Focus Delay Timeout. Why: Moving focus into the panel lets Esc and scroll work immediately, but must wait one tick for the panel to actually be mounted. How: This focuses panEleRef's current element after 20ms, guarded so it no-ops if the ref is not attached yet.



		return () => { // What: Effect Cleanup Function. Why: None of the Esc listener, the scroll lock, or the pending focus timeout may outlive this effect run. How: This removes the keydown listener, clears the focus timeout, and restores the scroller's own prior overflow and offset.


			document.removeEventListener( 'keydown', onKeyEscFun ); // What: Escape Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onKeyEscFun reference that was registered.

			clearTimeout( focDelTmo ); // What: Focus Timeout Teardown. Why: A pending focus call must not fire after this effect has already cleaned up. How: This cancels focDelTmo, matching the setTimeout above.

			if ( maiScrEle ) { // What: Scroll Restore Guard. Why: The scroller must end up exactly as it was before this modal opened, but only when the scroller actually existed to lock in the first place. How: This wraps the two restore writes below in a single existence check.


				maiScrEle.style.overflow = preOveStr; // What: Overflow Restore Call. Why: The scroller's own inline overflow must go back to whatever it was before this modal locked it. How: This writes preOveStr back onto the scroller's own style.

				maiScrEle.scrollTop = scrTopNum; // What: Scroll Position Restore Call. Why: The scroller must end up at the exact same offset it was showing before this modal opened. How: This writes scrTopNum back onto the scroller's own scrollTop.


			}


		};


	}, [ which ] ); // What: Effect Dependency Array. Why: This effect must re-run every time a different document (or no document) is requested. How: which changes both whether the modal is shown at all and which document's own title/body renders inside it.


	if ( !which ) return null; // What: No Document Render Guard. Why: LegalModal renders nothing at all until a document is actually requested. How: This returns null before any of the JSX below runs.



	const modTitStr = which === 'privacy' ? 'Privacy Policy' : 'Terms of Service'; // What: Modal Title String. Why: The same title is needed for both the visible heading and the dialog's own aria-label. How: This is computed once from which and read in both places below.



	return (


		<div
			className={ ` legal-modal-backdrop   ${ modCloBoo ? 'is-closing' : '' } ` }
			onMouseDown={ ( mouDowObj ) => { if ( mouDowObj.target === mouDowObj.currentTarget ) modDisFun(); } }
		>{ /* What: Container Backdrop Div Element. Why: This is the modal's own full-viewport scrim, and a direct click on it (not on the panel inside it) should dismiss the modal. How: This wraps the panel below and calls modDisFun only when the mousedown target is the backdrop itself. */ }


			<div
				ref={ panEleRef }
				className={ ` legal-modal   ${ modCloBoo ? 'is-closing' : '' } ` }
				aria-modal='true'
				aria-label={ modTitStr }
				role='dialog'
				tabIndex={ -1 }
			>{ /* What: Container Panel Div Element. Why: This is the actual visible, scrollable, focusable dialog panel. How: This is focused on open via panEleRef and swaps to its own "is-closing" class while modCloBoo is true. */ }


				<div className='legal-modal-head'>{ /* What: Container Head Div Element. Why: This groups the panel's own title and close button on one row. How: This renders the title span followed by the close button below. */ }


					<span className='legal-modal-note'>{ modTitStr }</span>{ /* What: Title Note Span Element. Why: This shows which document (Privacy Policy or Terms of Service) is currently open. How: This renders modTitStr as the panel's own visible heading text. */ }

					<button
						className='legal-modal-close'
						type='button'
						aria-label='Close'
						onClick={ modDisFun }
					>{ /* What: Close Action Button Element. Why: A user must always have an explicit, visible way to dismiss the modal. How: This calls modDisFun when clicked. */ }


						<Icon
							name='x'
							size={ 18 }
						/>{ /* What: Icon. Why: The close button needs a recognizable "x" glyph rather than just its own aria-label text. How: This renders the shared Icon component at size 18. */ }


					</button>


				</div>


				<div className='legal-modal-body'>{ /* What: Container Body Div Element. Why: This is the actual scrollable area the chosen document's own body renders into. How: This renders PriPolCom or TerSerCom below, chosen by which. */ }


					{ which === 'privacy' ? <PriPolCom /> : <TerSerCom /> }{ /* What: Document Choice Expression. Why: Only one of the two documents is ever shown at a time. How: This renders PriPolCom while which is 'privacy', otherwise TerSerCom. */ }


				</div>


			</div>


		</div>


	);


}

// #endregion LegalModal



export { LegalModal }; // What: Named Export. Why: tab-settings.jsx imports this by this exact name. How: This re-exports LegalModal as-is, deliberately left unrenamed since tab-settings.jsx (not yet reformatted) relies on this exact export name.



