


// #region Imports

import React from 'react'; // What: React. Why: Both documents are React components. How: This is used directly for React.Fragment and the components' return type.

// #endregion Imports



/**
 * legal-text.tsx = Legal Text
 *
 * @summary
 * The Privacy Policy and Terms of Service themselves, each a component that
 * owns its document's full body copy and nothing else, so the text lives in
 * one place. The Settings modal renders them in its panel, and the build
 * renders them into the standalone /privacy and /terms pages, which load
 * them outside the browser, so this file imports only React.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region PriPolCom

/**
 * PriPolCom = Privacy Policy Component
 *
 * @summary
 * Renders the Privacy Policy's own body copy (a title, a run of
 * sections, subsections, paragraphs and lists) as a React.Fragment, so
 * the Settings modal and the standalone /privacy page can each drop it into
 * a body of their own.
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

function PriPolCom () : React.JSX.Element {


	return (


		<React.Fragment>{ /* What: Container Fragment Element. Why: The document's own top-level elements need one wrapper so whichever container shows the document can render them as a single child, without adding an extra DOM node of its own. How: This wraps the policy's own heading, sections, and lists below. */ }


			<h1>Privacy Policy</h1>{ /* What: Document Title Heading Element. Why: This is the document's own top-level heading naming which legal document this is. How: This renders as a plain h1 at the top of the document body. */ }

			<p>Last updated: October 20, 2026</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent (where consent is required). This Privacy Policy has been created with the help of the <a
				href='https://www.termsfeed.com/privacy-policy-generator/'
				rel='noopener noreferrer'
				target='_blank'
			>Privacy Policy Generator</a>{ /* What: Inline Generator Credit Link Element. Why: This credits the third-party generator this legal text was drafted with. How: This opens the linked generator page in a new tab. */ }.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Interpretation and Definitions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Interpretation</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Definitions</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>For the purposes of this Privacy Policy:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }



			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Account</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means a unique account created for You to access Our Service or parts of Our Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Affiliate</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Company</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Privacy Policy) refers to Ease My Life.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Cookies</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website, among its many uses.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Country/State</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to: Missouri, United States.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Device</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any device that can access the Service, such as a computer, a cell phone or a digital tablet.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Personal Data</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (or &quot;Personal Information&quot;) is any information that relates to an identified or identifiable individual.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }

					<p>We use &quot;Personal Data&quot; and &quot;Personal Information&quot; interchangeably unless a law uses a specific term.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to the Website.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Service Provider</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Usage Data</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>User</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any individual who accesses or uses the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Website</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to Ease My Life, accessible from <a
						href='https://www.easemylife.app'
						rel='external nofollow noopener noreferrer'
						target='_blank'
					>https://www.easemylife.app</a>{ /* What: Inline Site Link Element. Why: This points the reader at the app's own live website. How: This opens the site in a new tab. */ }.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>



			<h2>Collecting and Using Your Personal Information</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Types of Data Collected</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<h4>Personal Data</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>Email address</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<h4>Usage Data</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>Usage Data is collected automatically when using the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of Our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h4>Tracking Technologies and Cookies</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies We use include beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }


			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li><strong>Cookies or Browser Cookies.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of Our Service.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>Web Beacons.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } Certain sections of Our Service and Our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>


			<p>Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Where required by law, We use non-essential cookies (such as analytics, advertising, and remarketing cookies) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We use both Session and Persistent Cookies for the purposes set out below:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }



			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Necessary / Essential Cookies</strong>{ /* What: Standalone Label Strong Element. Why: This bolds a short category name with nothing else in its own paragraph. How: This wraps the label text in a native strong tag for visual emphasis, with no continuing text after it. */ }</p>{ /* What: Bold Standalone Label Paragraph Element. Why: This bolds a short category name with nothing else on its own line, ahead of the labeled facts below it. How: This wraps the label text in a native strong tag for visual emphasis. */ }

					<p>Type: Session Cookies</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<p>Administered by: Us</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Cookies Policy / Notice Acceptance Cookies</strong>{ /* What: Standalone Label Strong Element. Why: This bolds a short category name with nothing else in its own paragraph. How: This wraps the label text in a native strong tag for visual emphasis, with no continuing text after it. */ }</p>{ /* What: Bold Standalone Label Paragraph Element. Why: This bolds a short category name with nothing else on its own line, ahead of the labeled facts below it. How: This wraps the label text in a native strong tag for visual emphasis. */ }

					<p>Type: Persistent Cookies</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<p>Administered by: Us</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<p>Purpose: These Cookies identify whether users have accepted the use of cookies on the Website.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Functionality Cookies</strong>{ /* What: Standalone Label Strong Element. Why: This bolds a short category name with nothing else in its own paragraph. How: This wraps the label text in a native strong tag for visual emphasis, with no continuing text after it. */ }</p>{ /* What: Bold Standalone Label Paragraph Element. Why: This bolds a short category name with nothing else on its own line, ahead of the labeled facts below it. How: This wraps the label text in a native strong tag for visual emphasis. */ }

					<p>Type: Persistent Cookies</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<p>Administered by: Us</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<p>Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your Account login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter Your preferences every time You use the Website.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


				</li>


			</ul>



			<p>For more information about the cookies We use and Your choices regarding cookies, please visit Our Cookies Policy or the Cookies section of Our Privacy Policy.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Use of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The Company may use Personal Data for the following purposes:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }



			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>To provide and maintain Our Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ }, including to monitor the usage of Our Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>To manage Your Account:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>For the performance of a contract:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>To contact You:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>To provide You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } with news, special offers, and general information about other goods, services and events which We offer that are similar to those that You have already purchased or inquired about. We send such marketing communications only where permitted by applicable law: where prior consent is required (for example, under the laws applicable in the EEA and the UK), We will send them only with Your consent; otherwise, We may send them until You opt out. You may opt out or withdraw Your consent at any time by using the unsubscribe link in any marketing email We send or by contacting Us.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>To manage Your requests:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } To attend and manage Your requests to Us.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>For business transfers:</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about Our Service users is among the assets transferred.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>For other purposes</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ }: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of Our promotional campaigns, and evaluating and improving Our Service, products, services, marketing and Your experience.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>



			<p>We may share Your Personal Data in the following situations:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }


			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li><strong>With Service Providers:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share Your Personal Data with Service Providers to monitor and analyze the use of Our Service, and to contact You.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>For business transfers:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>With Affiliates:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share Your Personal Data with Our affiliates, in which case We will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>With business partners:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } We may share Your Personal Data with Our business partners to offer You certain products, services or promotions. Business partners may use this information for their own purposes, as described in their own privacy policies.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>With other users:</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside the Service.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>With Your consent</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ }: We may disclose Your Personal Data for any other purpose with Your consent.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>


			<h3>Retention of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with Our legal obligations (for example, if We are required to retain Your data to comply with applicable laws), resolve disputes, and enforce Our legal agreements and policies.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods below are maximum periods (&quot;up to&quot;) and We may delete or anonymize data sooner when it is no longer needed for the relevant purpose. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }



			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p>Account Information</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


						<li>User Accounts: retained for the duration of Your Account relationship plus up to 24 months after account closure to handle any post-termination issues or resolve disputes.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					</ul>


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p>Customer Support Data</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }

					<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


						<li>Support tickets and correspondence: up to 24 months from the date of ticket closure to resolve follow-up inquiries, track service quality, and defend against potential legal claims.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

						<li>Chat transcripts: up to 24 months for quality assurance and staff training purposes.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					</ul>


				</li>



				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p>Usage Data</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


					<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


						<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


							<p>Website analytics data (cookies, IP addresses, device identifiers): up to 24 months from the date of collection, which allows us to analyze trends while respecting privacy principles.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


						</li>

						<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


							<p>Server logs (IP addresses, access times): up to 24 months for security monitoring and troubleshooting purposes.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


						</li>


					</ul>


				</li>


			</ul>



			<p>Usage Data is retained in accordance with the retention periods described above, and may be retained longer only where necessary for security, fraud prevention, or legal compliance.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We may retain Personal Data beyond the periods stated above for different reasons:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>Legal obligation: We are required by law to retain specific data (e.g., financial records for tax authorities).</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Legal claims: Data is necessary to establish, exercise, or defend legal claims.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Your explicit request: You ask Us to retain specific information.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Technical limitations: Data exists in backup systems that are scheduled for routine deletion.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<p>You may request information about how long We will retain Your Personal Data by contacting Us.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>When retention periods expire, We securely delete or anonymize Personal Data according to the following procedures:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>Deletion: Personal Data is removed from Our systems and no longer actively processed.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Backup retention: Residual copies may remain in encrypted backups for a limited period consistent with Our backup retention schedule and are not restored except where necessary for security, disaster recovery, or legal compliance.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Anonymization: In some cases, We convert Personal Data into anonymous statistical data that cannot be linked back to You. This anonymized data may be retained indefinitely for research and analytics.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<h3>Transfer of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. This means that this information may be transferred to and maintained on computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of Your jurisdiction.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and, where relevant, supplementary measures. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of Your data and other personal information.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Delete Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Our Service may give You the ability to delete certain information about You from within the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You may update, amend, or delete Your information at any time by signing in to Your Account, if You have one, and visiting the account settings section that allows You to manage Your personal information. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Disclosure of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<h4>Business Transactions</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h4>Law Enforcement</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h4>Other Legal Requirements</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>Comply with a legal obligation</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Protect and defend the rights or property of the Company</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Prevent or investigate possible wrongdoing in connection with the Service</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Protect the personal safety of Users of the Service or the public</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Protect against legal liability</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<h3>Security of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Accounts, Sync, and Payments</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Ease My Life works without an account. Everything You create is stored on Your own device, and none of it is sent to Us unless You sign in and buy sync across devices.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Your Account</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>If You sign in, Your Account is managed by Google Firebase Authentication. It stores Your email address and, if You sign in with Google, the basic profile details Google shares, such as Your name. It also records whether You have bought sync. Signing in on its own sends none of Your Ease My Life data anywhere.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Your Cloud Copy</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>If You buy sync, a copy of Your Ease My Life data (Your pickers, items, reminders, conditionals, Today list, holidays, and history) is stored in Google Cloud Firestore, in data centers in the United States, so that Your other signed-in devices can download it. Your theme and display settings are not uploaded, and stay separate on each device.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Your cloud copy is encrypted while it travels between Your devices and Google, and Google encrypts it where it is stored. It is not end-to-end encrypted, so it is protected by Google's security and by access rules that let only Your own signed-in Account read or change it. We do not read, sell, or share Your data, and We use it only to keep Your devices in sync.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We keep Your cloud copy for as long as Your Account has one, until You delete it.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Payments and Tips</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>Purchases are handled by Polar (polar.sh), which acts as the seller of record and processes payment through Stripe. We never see or store Your card details. Polar shares with Us the email address and order details needed to unlock sync for Your Account. Optional tips are handled by Ko-fi (ko-fi.com). The information You give Polar or Ko-fi is covered by their own privacy policies.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Deleting Your Cloud Copy</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>You can delete Your cloud copy at any time in Settings, under Data control, by choosing Reset and then Reset and delete cloud copy. That removes Your data from Firestore and signs the device out. A device that is still signed in to Your Account will upload its own data again the next time it syncs, so sign out of Your other devices first, or reset them too. Signing out keeps everything on the device. To delete Your Account itself, contact Us.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Children's and Minors' Privacy</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service is not directed to, and We do not knowingly collect Personal Information from, anyone under the age of 16.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us. If We become aware that We have collected Personal Information from anyone under the age of 16, We will take steps to remove that information from Our servers as soon as reasonably possible.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Some countries and states set a higher age at which an individual can consent to the processing of their own Personal Information. Where We rely on consent as a legal basis and the law applicable to a User sets an age higher than 16, We may require the consent of that User's parent or guardian before We collect and use their Personal Information.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Links to Other Websites</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Changes to this Privacy Policy</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Contact Us</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If You have any questions about this Privacy Policy, You can contact Us:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>By email: support@easemylife.app</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


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
 * the Settings modal and the standalone /terms page can each drop it into a
 * body of their own.
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

function TerSerCom () : React.JSX.Element {


	return (


		<React.Fragment>{ /* What: Container Fragment Element. Why: The document's own top-level elements need one wrapper so whichever container shows the document can render them as a single child, without adding an extra DOM node of its own. How: This wraps the terms' own heading, sections, and lists below. */ }


			<h1>Terms and Conditions</h1>{ /* What: Document Title Heading Element. Why: This is the document's own top-level heading naming which legal document this is. How: This renders as a plain h1 at the top of the document body. */ }

			<p>Last updated: October 20, 2026</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Please read these terms and conditions carefully before using Our Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Interpretation and Definitions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Interpretation</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Definitions</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>For the purposes of these Terms and Conditions:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }



			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Affiliate</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Country/State</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to: Missouri,  United States</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Company</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in these Terms and Conditions) refers to Ease My Life.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Device</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any device that can access the Service such as a computer, a cell phone or a digital tablet.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to the Website.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Terms and Conditions</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (also referred to as &quot;Terms&quot;) means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service. These Terms and Conditions have been created with the help of the <a
						href='https://www.termsfeed.com/terms-conditions-generator/'
						rel='noopener noreferrer'
						target='_blank'
					>TermsFeed Terms and Conditions Generator</a>{ /* What: Inline Generator Credit Link Element. Why: This credits the third-party generator this legal text was drafted with. How: This opens the linked generator page in a new tab. */ }.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Third-Party Social Media Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Website</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to Ease My Life, accessible from <a
						href='https://www.easemylife.app'
						rel='external nofollow noopener noreferrer'
						target='_blank'
					>https://www.easemylife.app</a>{ /* What: Inline Site Link Element. Why: This points the reader at the app's own live website. How: This opens the site in a new tab. */ }</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>



			<h2>Acknowledgment</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Links to Other Websites</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Links from a Third-Party Social Media Service</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service's terms and privacy policies.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Paid Sync</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Sync across devices is an optional, one-time purchase, not a subscription. It unlocks sync for the Account You are signed in with when You buy it, for as long as We offer the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Purchases are sold and processed by Polar, and refunds are handled through Polar under its refund terms. If a purchase is refunded, sync is turned off for that Account. The data on Your devices is not affected.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Sync relies on services run by others, including Google Firebase and Polar, and We cannot promise it will always be available or free of errors. Keep a backup by exporting Your data from Settings from time to time. If We ever stop offering sync, Ease My Life will keep working on Your devices, and You will still be able to export Your data.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Termination</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Upon termination, Your right to use the Service will cease immediately.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Limitation of Liability</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Governing Law</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>The laws of the Country/State, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Disputes Resolution</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>For European Union (EU) Users</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>United States Legal Compliance</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a &quot;terrorist supporting&quot; country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Severability and Waiver</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Severability</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Waiver</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Translation Interpretation</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Changes to These Terms and Conditions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Contact Us</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If you have any questions about these Terms and Conditions, You can contact us:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>By email: support@easemylife.app</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>


		</React.Fragment>


	);


}

// #endregion TerSerCom

// #endregion Components



// #region Exports

export { PriPolCom, TerSerCom }; // What: Named Exports. Why: The Settings modal and the standalone legal pages both render these documents. How: This exports both components by name.

// #endregion Exports


